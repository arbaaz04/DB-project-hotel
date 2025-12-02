--Crud actions for ui interactions (thin backend style)
--1 reservation listing
create or replace function list_reservations()
returns table (
  reservation_id integer,
  guest_name varchar,
  check_in date,
  check_out date,
  room_number varchar,
  current_status varchar,
  totalcharged numeric,
  typeid integer
)
language plpgsql
as $$
begin
return query
select res.reservationID, g.name, res.checkinDate, res.checkoutDate, r.roomNumber, res.status, res.totalcharged, res.typeID from reservation res
join guest g on res.guestID = g.guestID
left join room r on res.roomID = r.roomID
order by res.reservationID desc;
end;
$$;

--2 listing all rooms
create or replace function list_all_rooms()
returns table (
  room_id integer,
  room_number varchar,
  type_name varchar,
  current_status varchar
)
language plpgsql
as $$
begin
return query
select r.roomID, r.roomNumber, rt.name, r.status from room r
join room_type rt on r.typeID = rt.typeID
order by r.roomNumber;
end;
$$;

--3 managing service items 
create or replace procedure manage_service_item(
  p_mode varchar, p_item_id integer default null, p_name varchar default null, p_price numeric default null
)
language plpgsql
as $$
begin
if p_mode = 'CREATE' then
  insert into service_item (name, price) values (p_name, p_price);
elsif p_mode = 'UPDATE' then
  update service_item set name = coalesce(p_name, name), price = coalesce(p_price, price)
  where itemid = p_item_id;
elsif p_mode = 'DELETE' then
  delete from service_item where itemid = p_item_id;
else
  raise exception 'invalid mode specified for service item management.';
end if;
end;
$$;

--4 managing room configs
create or replace procedure manage_room_config(
  p_mode varchar, p_room_id integer default null, p_room_number varchar default null, p_type_id integer default null, p_status varchar default null
)
language plpgsql
as $$
begin
if p_mode = 'CREATE' then
  insert into room (roomNumber, typeID, status) values (p_room_number, p_type_id, 'clean');
elsif p_mode = 'UPDATE' then
  update room 
        set 
            roomNumber = coalesce(p_room_number, roomNumber), 
            typeID = coalesce(p_type_id, typeID),
            status = coalesce(p_status, status)
        where roomID = p_room_id;
    elsif p_mode = 'DELETE' then
        delete from room where roomID = p_room_id and status not in ('occupied', 'dirty');
    else
        raise exception 'invalid mode specified for room configuration management.';
    end if;
end;
$$;

--5 view all guests
create or replace function list_all_guests()
returns table (
  guest_id integer,
  guest_name varchar,
  nic varchar,
  passport varchar,
  email varchar,
  booking_count integer
)
language plpgsql
as $$
begin
return query
select g.guestID, g.name, g.nic, g.passport, g.email, g.bookingCount from guest g
order by g.name;
end;
$$;

--6 list all staff
create or replace function list_all_staff()
returns table (
  staff_id integer,
  user_name varchar,
  staff_role varchar
)
language plpgsql
as $$
begin
return query
select s.staffID, s.userName, s.role from staff s
order by s.userName;
end;
$$;

--7 list all service items
create or replace function list_service_items()
returns table (
  itemid integer,
  item_name varchar,
  price numeric
)
language plpgsql
as $$
begin
return query
select si.itemID, si.name, si.price from service_item si
order by si.name;
end;
$$;

--8 get available rooms for check-in (clean rooms of specific type)
create or replace function get_available_rooms_for_checkin(p_type_id integer)
returns table (
  room_id integer,
  room_number varchar,
  type_name varchar
)
language plpgsql
as $$
begin
return query
select r.roomID, r.roomNumber, rt.name
from room r
join room_type rt on r.typeID = rt.typeID
where r.typeID = p_type_id and r.status = 'clean'
order by r.roomNumber;
end;
$$;
