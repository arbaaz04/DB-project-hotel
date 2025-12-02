--Main functions for implementing business logic
--1 getting available rooms for booking at reception
create or replace function get_available_rooms(
  p_start_date date, p_end_date date
) returns table(
  type_id integer,
  room_type_name varchar,
  effective_daily_rate numeric
)

language plpgsql
as $$
begin
return query with blocked_rooms as(
  select r.roomid from reservation res
  join room r on res.roomid = r.roomid
  where res.status in ('Confirmed', 'Checked-In')
  and res.checkinDate < p_end_date and res.checkoutDate > p_start_date
),
available_type_counts as(
  select r.typeid, count(r.roomid) as available_count from room r
  left join blocked_rooms br on r.roomid = br.roomid
  where br.room_id is null and r.status = 'Clean' 
  group by 1
)
select atc.typeid, rt.name, rp.dailyrate from available_type_counts atc
join room_type rt on atc.typeid = rt.typeid
join rate_plan rp on atc.typeid = rp.typeid
where atc.available_count > 0
and p_start_date >= rp.startDate
and p_end_date <= rp.endDate
limit 1;
end;
$$;

--2 create new reservation
create or replace procedure create_reservation(
  p_guest_id integer, 
  p_staff_id integer, 
  p_type_id integer, 
  p_checkin_date date, 
  p_checkout_date date, 
  p_status varchar default 'confirmed'
)
language plpgsql
as $$
declare 
v_total_room_rate numeric := 0.0;
v_discount_rate numeric := 0.0;
v_booking_count integer;
v_conflicting_reservations integer;
v_total_clean_rooms integer;
v_reservation_id integer;
begin
if p_checkin_date >= p_checkout_date then 
  raise exception 'check-out date must be after check-in date.';
end if;

select bookingcount into v_booking_count from guest where guestid = p_guest_id;
if v_booking_count >= 2 then 
  v_discount_rate := 0.10;
end if;

with date_range as(
  select generate_series(p_checkin_date, p_checkout_date - interval '1 day', '1 day')::date as day
)
select sum(rp.dailyrate) into v_total_room_rate 
from date_range dr
join rate_plan rp on rp.typeid = p_type_id 
where dr.day >= rp.startdate and dr.day <= rp.enddate;

if v_total_room_rate is null or v_total_room_rate = 0.0 then 
  raise exception 'rate plan is incomplete or unavailable for the requested dates.';
end if;

v_total_room_rate := v_total_room_rate * (1.0 - v_discount_rate);

select count(roomid) into v_total_clean_rooms 
from room r 
where r.typeid = p_type_id and r.status = 'clean';

select count(reservationid) into v_conflicting_reservations
from reservation res
where res.typeid = p_type_id 
  and res.status in ('confirmed', 'checked-in')
  and res.checkindate < p_checkout_date
  and res.checkoutdate > p_checkin_date;

if v_total_clean_rooms <= v_conflicting_reservations then
    raise exception 'room type inventory unavailable for the requested dates.';
end if;

insert into reservation( guestid, staffid, roomid, typeid, checkindate, checkoutdate, totalcharged, status) 
values(p_guest_id, p_staff_id, null, p_type_id, p_checkin_date, p_checkout_date, v_total_room_rate, p_status)
returning reservationid into v_reservation_id;

update guest
set bookingcount = bookingcount + 1,
loyaltystatus = case
  when (select bookingcount + 1 from guest where guestid = p_guest_id) >= 2 then 'regular'
  else loyaltystatus
end
where guestid = p_guest_id;
end;
$$;

--3 guest checkin
create or replace procedure checkin_guest(
  p_reservation_id integer, p_assigned_room_number varchar
)
language plpgsql
as $$
declare
v_room_status varchar;
v_reservation_type_id integer;
v_assigned_room_type_id integer;
v_assigned_room_id integer;
begin
select typeid into v_reservation_type_id from reservation
where reservationid = p_reservation_id and status = 'confirmed';

if v_reservation_type_id is null then 
raise exception 'Reservation % cannot be checked in. Status must be "confirmed".', p_reservation_id;
end if;

-- Look up room by room number instead of ID
select roomID, status, typeID into v_assigned_room_id, v_room_status, v_assigned_room_type_id 
from room
where roomNumber = p_assigned_room_number;

if v_room_status is null then
raise exception 'Room % does not exist.', p_assigned_room_number;
end if;

if v_room_status != 'clean' then
raise exception 'Room % is currently not clean (Status: %); cannot check in.', p_assigned_room_number, v_room_status;
end if;

if v_assigned_room_type_id != v_reservation_type_id then
raise exception 'Room type mismatch. Reservation requires type ID %, assigned room is type ID %.', v_reservation_type_id, v_assigned_room_type_id;
end if;

update reservation
set roomid = v_assigned_room_id, status = 'checked-in', actualcheckindate = NOW()
where reservationid = p_reservation_id;

update room
set status = 'occupied' where roomid = v_assigned_room_id;
end;
$$;

--4 process guest checkout
create or replace procedure process_checkout(
  p_reservation_id integer, p_payment_amount numeric, p_payment_type varchar
)
language plpgsql
as $$
declare
v_total_charges numeric;
v_total_payments_made numeric;
v_outstanding_balance numeric;
v_room_id integer;
v_reservation_status varchar;
begin
select roomid, status into v_room_id, v_reservation_status 
from reservation
where reservationid = p_reservation_id;

if v_reservation_status != 'checked-in' or v_room_id is null then
  raise exception 'reservation % must be checked-in and assigned a room before checkout. status: %.', p_reservation_id, v_reservation_status;
end if;

select coalesce(sum(amount), 0) into v_total_charges
from charge_transaction
where reservationid = p_reservation_id;

select coalesce(sum(amount), 0) into v_total_payments_made
from payment
where reservationid = p_reservation_id;

v_outstanding_balance := v_total_charges - v_total_payments_made;

if p_payment_amount < v_outstanding_balance then
  raise exception 'payment insufficient. outstanding balance is %, payment received is %.', v_outstanding_balance, p_payment_amount;
end if;

if p_payment_amount > 0 then 
  insert into payment (reservationid, amount, paymenttype, paymentdate)
  values(p_reservation_id, p_payment_amount, p_payment_type, now());
end if;

update reservation
set 
  status = 'checked-out',
  actualcheckoutdate = now()
where reservationid = p_reservation_id;

update room
set status = 'dirty' where roomid = v_room_id;
end;
$$;

--5 room status update to clean
create or replace procedure update_room_status_clean(
  p_room_id integer
)
language plpgsql
as $$
declare
v_room_status varchar;
begin
select status into v_room_status from room where roomid = p_room_id;

if v_room_status is null then raise exception 'Room ID % does not exist.', p_room_id;
end if;
update room
set status = 'clean' where roomid = p_room_id;

end;
$$;

--6 cancel reservation before checkin
create or replace procedure cancel_reservation (
  p_reservation_id integer
)
language plpgsql
as $$
declare
v_guest_id integer;
v_status varchar;

begin
select guestid, status into v_guest_id, v_status from reservation where reservationid = p_reservation_id;

if v_status is null then raise exception 'Reservation % does not exist.', p_reservation_id;
end if;

if v_status != 'confirmed' then raise exception 'Reservation % cannot be canceled. Status is currently %.', p_reservation_id, v_status;
end if;

update reservation
set status = 'canceled',
roomid = null
where reservationid = p_reservation_id;

update guest
set bookingcount = bookingcount - 1
where guestID = v_guest_id and bookingcount > 0;
end;
$$;

--7 get outstanding balance for a reservation
create or replace function get_outstanding_balance(p_reservation_id integer)
returns table(
  total_charges numeric,
  total_payments numeric,
  outstanding_balance numeric
)
language plpgsql
as $$
begin
  return query
  select 
    coalesce((select sum(ct.amount) from charge_transaction ct where ct.reservationID = p_reservation_id), 0) as total_charges,
    coalesce((select sum(p.amount) from payment p where p.reservationID = p_reservation_id), 0) as total_payments,
    coalesce((select sum(ct.amount) from charge_transaction ct where ct.reservationID = p_reservation_id), 0) - 
    coalesce((select sum(p.amount) from payment p where p.reservationID = p_reservation_id), 0) as outstanding_balance;
end;
$$;

--8 add minibar charge
create or replace procedure add_minibar_charge(
  p_reservation_id integer,
  p_item_id integer,
  p_quantity integer
)
language plpgsql
as $$
declare
v_reservation_status varchar;
begin
  -- Verify reservation is checked-in
  select status into v_reservation_status from reservation where reservationid = p_reservation_id;
  
  if v_reservation_status is null then
    raise exception 'Reservation % does not exist.', p_reservation_id;
  end if;
  
  if v_reservation_status != 'checked-in' then
    raise exception 'Cannot add minibar charges. Reservation status is % (must be checked-in).', v_reservation_status;
  end if;
  
  -- Insert into minibar_charge, trigger will handle charge_transaction
  insert into minibar_charge (reservationid, itemid, quantity, time)
  values (p_reservation_id, p_item_id, p_quantity, now());
end;
$$;