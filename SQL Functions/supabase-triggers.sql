--Helper triggers to complement the business logic
--1 minibar charge automation trigger
create or replace function trg_process_minibar_charge()
returns trigger as $$
declare
v_item_price numeric;
begin
select price into v_item_price from service_item where itemid = New.itemid;

insert into charge_transaction (reservationid, description, amount, time, type)
values (New.reservationID, 'Minibar Charge: ' || (select name from service_item where itemid = New.itemID), New.quantity * v_item_price, NOW(), 'Service');
return new;
end;
$$ language plpgsql;

create trigger tr_minibar_charge_insert
after insert on minibar_charge
for each row
execute function trg_process_minibar_charge();

--2 initial folio creation trigger
create or replace function trg_insert_initial_folio()
returns trigger as $$
begin
insert into charge_transaction(reservationid, description, amount, time, type)
values(New.reservationid, 'Room Rate Charge', New.totalcharged, NOW(), 'Room Rate');
return new;
end;
$$ language plpgsql;

create trigger tr_auto_folio_creation
after insert on reservation
for each row
execute function trg_insert_initial_folio();

--3 auto payment on checkin trigger
create or replace function trg_auto_pay_room_charge()
returns trigger as $$
declare
v_room_rate_amount numeric;
begin
select amount into v_room_rate_amount from charge_transaction where reservationid = NEW.reservationid and type = 'Room Rate';

if v_room_rate_amount is not null and v_room_rate_amount > 0 then
insert into payment (reservationid, amount, paymenttype, paymentdate)
values (NEW.reservationID, v_room_rate_amount, 'Check-In Deposit/Guarantee', NOW());
end if;
return new;
end;
$$ language plpgsql;

create trigger tr_auto_pay_on_checkin
after update of status on reservation
for each row
when (OLD.status = 'confirmed' and NEW.status = 'checked-in')
execute function trg_auto_pay_room_charge();

--4 clear folio on cancellation trigger
create or replace function trg_clear_folio_on_cancel()
returns trigger as $$
declare
v_balance numeric;
v_total_charges numeric;
v_total_payments numeric;
begin
select coalesce(sum(amount), 0) into v_total_charges from charge_transaction where reservationid = NEW.reservationid;
select coalesce(sum(amount), 0) into v_total_payments from payment where reservationid = NEW.reservationid;

v_balance := v_total_charges - v_total_payments;

if v_balance != 0 then
insert into charge_transaction (reservationid, description, amount, time, type)
values (NEW.reservationid, 'Folio Cleared (Cancellation Reversal)', -v_balance, NOW(), 'Cancellation Reversal');
end if;
return new;
end;
$$ language plpgsql;

create trigger tr_clear_folio_on_cancel
after update of status on reservation
for each row
when (NEW.status = 'canceled')
execute function trg_clear_folio_on_cancel();