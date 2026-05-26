CREATE OR REPLACE FUNCTION public.purge_old_events(p_days_to_keep INTEGER DEFAULT 90)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted BIGINT;
BEGIN
    WITH removed AS (
        DELETE FROM public.store_events
        WHERE created_at < now() - (p_days_to_keep || ' days')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted FROM removed;
    RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_events(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_old_events(INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.purge_old_audit_logs(p_days_to_keep INTEGER DEFAULT 730)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted BIGINT;
BEGIN
    WITH removed AS (
        DELETE FROM public.audit_logs
        WHERE created_at < now() - (p_days_to_keep || ' days')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted FROM removed;
    RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_audit_logs(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_old_audit_logs(INTEGER) TO service_role;

CREATE OR REPLACE FUNCTION public.purge_old_email_jobs(p_days_to_keep INTEGER DEFAULT 30)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted BIGINT;
BEGIN
    WITH removed AS (
        DELETE FROM public.email_queue
        WHERE status IN ('sent', 'failed')
          AND created_at < now() - (p_days_to_keep || ' days')::INTERVAL
        RETURNING id
    )
    SELECT COUNT(*) INTO v_deleted FROM removed;
    RETURN v_deleted;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_old_email_jobs(INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_old_email_jobs(INTEGER) TO service_role;
