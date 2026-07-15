
-- 1. Lock down has_role SECURITY DEFINER
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

-- 2. Orders: replace always-true anon insert with validated authenticated insert
DROP POLICY IF EXISTS "Anyone can create order" ON public.orders;
REVOKE INSERT ON public.orders FROM anon;

CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (
  length(btrim(customer_name)) BETWEEN 1 AND 200
  AND length(btrim(customer_phone)) BETWEEN 7 AND 20
  AND total >= 0
  AND subtotal >= 0
);

-- 3. Reservations: replace always-true anon insert with validated authenticated insert
DROP POLICY IF EXISTS "Anyone can create reservation" ON public.reservations;
REVOKE INSERT ON public.reservations FROM anon;

CREATE POLICY "Authenticated users can create reservations"
ON public.reservations
FOR INSERT
TO authenticated
WITH CHECK (
  length(btrim(customer_name)) BETWEEN 1 AND 200
  AND length(btrim(customer_phone)) BETWEEN 7 AND 20
  AND guests BETWEEN 1 AND 50
  AND reservation_date >= (CURRENT_DATE - INTERVAL '1 day')
);
