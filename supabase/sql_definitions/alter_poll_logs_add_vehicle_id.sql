-- Add vehicle_id column to poll_logs
ALTER TABLE public.poll_logs
ADD COLUMN vehicle_id UUID;

-- Add foreign key constraint to vehicles table
ALTER TABLE public.poll_logs
ADD CONSTRAINT poll_logs_vehicle_id_fkey
FOREIGN KEY (vehicle_id) REFERENCES public.vehicles(id) ON DELETE SET NULL;

-- Create an index for efficient lookups per vehicle
CREATE INDEX idx_poll_logs_vehicle_time ON public.poll_logs (vehicle_id, created_at);
