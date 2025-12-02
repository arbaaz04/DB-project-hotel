-- Rate plan management functions
-- 1. List all rate plans
create or replace function list_rate_plans()
returns table (
  rate_plan_id integer,
  type_id integer,
  type_name varchar,
  plan_name varchar,
  daily_rate numeric,
  start_date date,
  end_date date
)
language plpgsql
as $$
begin
return query
select 
  rp.ratePlanID, 
  rp.typeID, 
  rt.name, 
  rp.name, 
  rp.dailyRate, 
  rp.startDate, 
  rp.endDate 
from rate_plan rp
join room_type rt on rp.typeID = rt.typeID
order by rp.startDate desc, rt.name;
end;
$$;

-- 2. Manage rate plans (CREATE, UPDATE, DELETE)
create or replace procedure manage_rate_plan(
  p_mode varchar,
  p_rate_plan_id integer default null,
  p_type_id integer default null,
  p_name varchar default null,
  p_daily_rate numeric default null,
  p_start_date date default null,
  p_end_date date default null
)
language plpgsql
as $$
begin
  if p_mode = 'CREATE' then
    -- Validate dates
    if p_start_date >= p_end_date then
      raise exception 'Start date must be before end date.';
    end if;
    
    -- Insert new rate plan
    insert into rate_plan (typeID, name, dailyRate, startDate, endDate)
    values (p_type_id, p_name, p_daily_rate, p_start_date, p_end_date);
    
  elsif p_mode = 'UPDATE' then
    -- Validate dates if both provided
    if p_start_date is not null and p_end_date is not null then
      if p_start_date >= p_end_date then
        raise exception 'Start date must be before end date.';
      end if;
    end if;
    
    -- Update rate plan
    update rate_plan
    set 
      typeID = coalesce(p_type_id, typeID),
      name = coalesce(p_name, name),
      dailyRate = coalesce(p_daily_rate, dailyRate),
      startDate = coalesce(p_start_date, startDate),
      endDate = coalesce(p_end_date, endDate)
    where ratePlanID = p_rate_plan_id;
    
    -- Revalidate dates after update
    if exists (
      select 1 from rate_plan 
      where ratePlanID = p_rate_plan_id 
      and startDate >= endDate
    ) then
      raise exception 'Update failed: Start date must be before end date.';
    end if;
    
  elsif p_mode = 'DELETE' then
    -- Delete rate plan (only if not referenced in reservations)
    delete from rate_plan where ratePlanID = p_rate_plan_id;
    
  else
    raise exception 'Invalid mode specified for rate plan management.';
  end if;
end;
$$;

-- 3. Get active rate plans for a specific date range and room type
create or replace function get_active_rate_plans(
  p_type_id integer,
  p_check_date date
)
returns table (
  rate_plan_id integer,
  plan_name varchar,
  daily_rate numeric,
  start_date date,
  end_date date
)
language plpgsql
as $$
begin
return query
select 
  rp.ratePlanID,
  rp.name,
  rp.dailyRate,
  rp.startDate,
  rp.endDate
from rate_plan rp
where rp.typeID = p_type_id
  and p_check_date >= rp.startDate
  and p_check_date <= rp.endDate
order by rp.dailyRate;
end;
$$;
