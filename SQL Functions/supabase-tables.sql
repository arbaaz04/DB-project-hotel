--Tables creations for database
create table staff(
  staffID serial primary key,
  username varchar(100) unique not null,
  passwordHash varchar(100) not null,
  role varchar(50) not null
);

create table guest(
  guestID serial primary key,
  name varchar(100) not null,
  nic varchar(50) unique,
  passport varchar(50) unique,
  phone varchar(20),
  email varchar(100) unique,
  bookingCount integer default 0,
  loyaltyStatus varchar(20) default 'Standard'
);

create table room_type(
  typeID serial primary key,
  name varchar(100) unique not null,
  description varchar(256),
  maxCapacity integer not null
);

create table service_item(
  itemID serial primary key,
  name varchar(100) unique not null,
  price numeric(8,2) not null
);

create table room(
  roomID serial primary key,
  roomNumber varchar(10) unique not null,
  typeID integer not null references room_type(typeID),
  status varchar(15) not null
);

create table rate_plan(
  ratePlanID serial primary key,
  typeID integer not null references room_type(typeID),
  name varchar(100) not null,
  dailyRate numeric(10,2) not null,
  startDate date not null,
  endDate date not null,
  check (startDate < endDate)
);

create table reservation(
  reservationID serial primary key,
  guestID integer not null references guest(guestID),
  staffID integer not null references staff(staffID),
  typeID integer references room_type(typeID),
  roomID integer references room(roomID),
  checkinDate date not null,
  checkoutDate date not null,
  actualCheckinDate timestamp,
  actualCheckoutDate timestamp,
  totalCharged numeric(10,2) not null,
  status varchar(20) not null,
  check (checkinDate < checkoutDate)
);

create table charge_transaction (
  transactionID serial primary key,
  reservationID integer not null references reservation(reservationID),
  description varchar(256) not null,
  amount numeric(10,2) not null,
  time timestamp not null,
  type varchar(50) not null
);

create table payment(
  paymentID serial primary key,
  reservationID integer not null references reservation(reservationID),
  amount numeric(10,2) not null,
  paymentType varchar(50) not null,
  paymentDate timestamp not null
);

create table minibar_charge(
  minibarChargeID serial primary key,
  reservationID integer not null references reservation(reservationID),
  itemID integer not null references service_item(itemID),
  quantity integer not null,
  time timestamp not null
);