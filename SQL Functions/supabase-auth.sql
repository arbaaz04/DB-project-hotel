--Authentication and guest management functions
--1 staff authentication
create or replace function authenticate_staff(
  p_username varchar, p_password varchar
)
returns table (
  staff_id integer,
  user_name varchar,
  staff_role varchar,
  success boolean
)
language plpgsql
as $$
declare
v_password_hash varchar;
begin
select passwordhash into v_password_hash from staff where username = p_username;

if v_password_hash is null then
  return query select null::integer, null::varchar, null::varchar, false;
  return;
end if;

if v_password_hash = p_password then
  return query
  select s.staffid, s.username, s.role, true
  from staff s where s.username = p_username;
else
  return query select null::integer, null::varchar, null::varchar, false;
end if;
end;
$$;

--2 create or update guest
create or replace function manage_guest(
  p_mode varchar,
  p_guest_id integer default null,
  p_name varchar default null,
  p_nic varchar default null,
  p_passport varchar default null,
  p_phone varchar default null,
  p_email varchar default null
)
returns table (
  guest_id integer,
  guest_name varchar,
  guest_email varchar
)
language plpgsql
as $$
declare
v_guest_id integer;
begin
if p_mode = 'CREATE' then
  insert into guest (name, nic, passport, phone, email, bookingcount, loyaltystatus)
  values (p_name, p_nic, p_passport, p_phone, p_email, 0, 'standard')
  returning guestid into v_guest_id;
  
  return query
  select g.guestid, g.name, g.email
  from guest g where g.guestid = v_guest_id;
  
elsif p_mode = 'UPDATE' then
  update guest
  set name = coalesce(p_name, name),
      nic = coalesce(p_nic, nic),
      passport = coalesce(p_passport, passport),
      phone = coalesce(p_phone, phone),
      email = coalesce(p_email, email)
  where guestid = p_guest_id;
  
  return query
  select g.guestid, g.name, g.email
  from guest g where g.guestid = p_guest_id;
  
else
  raise exception 'invalid mode for guest management.';
end if;
end;
$$;

--3 get reservation details with all related info
create or replace function get_reservation_details(
  p_reservation_id integer
)
returns table (
  reservation_id integer,
  guest_id integer,
  guest_name varchar,
  guest_email varchar,
  guest_phone varchar,
  staff_name varchar,
  room_number varchar,
  room_type varchar,
  checkin_date date,
  checkout_date date,
  actual_checkin_date timestamp,
  actual_checkout_date timestamp,
  total_charged numeric,
  current_status varchar,
  total_payments numeric,
  balance numeric
)
language plpgsql
as $$
begin
return query
select 
  res.reservationid,
  g.guestid,
  g.name,
  g.email,
  g.phone,
  s.username,
  r.roomnumber,
  rt.name,
  res.checkindate,
  res.checkoutdate,
  res.actualcheckindate,
  res.actualcheckoutdate,
  coalesce((select sum(ct.amount) from charge_transaction ct where ct.reservationid = res.reservationid), 0.0) as total_charged,
  res.status,
  coalesce((select sum(p.amount) from payment p where p.reservationid = res.reservationid), 0.0) as total_payments,
  coalesce((select sum(ct.amount) from charge_transaction ct where ct.reservationid = res.reservationid), 0.0) - 
  coalesce((select sum(p.amount) from payment p where p.reservationid = res.reservationid), 0.0) as balance
from reservation res
join guest g on res.guestid = g.guestid
join staff s on res.staffid = s.staffid
left join room r on res.roomid = r.roomid
left join room_type rt on res.typeid = rt.typeid
where res.reservationid = p_reservation_id;
end;
$$;

--4 get all charges for a reservation
create or replace function get_reservation_charges(
  p_reservation_id integer
)
returns table (
  transaction_id integer,
  charge_description varchar,
  charge_amount numeric,
  charge_time timestamp,
  charge_type varchar
)
language plpgsql
as $$
begin
return query
select ct.transactionid, ct.description, ct.amount, ct.time, ct.type
from charge_transaction ct
where ct.reservationid = p_reservation_id
order by ct.time;
end;
$$;

--5 get all payments for a reservation
create or replace function get_reservation_payments(
  p_reservation_id integer
)
returns table (
  payment_id integer,
  payment_amount numeric,
  payment_type varchar,
  payment_date timestamp
)
language plpgsql
as $$
begin
return query
select p.paymentid, p.amount, p.paymenttype, p.paymentdate
from payment p
where p.reservationid = p_reservation_id
order by p.paymentdate;
end;
$$;
