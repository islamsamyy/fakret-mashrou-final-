CREATE OR REPLACE FUNCTION confirm_investment(
  p_investment_id UUID,
  p_investor_id UUID,
  p_amount NUMERIC
)
RETURNS JSONB AS $$
DECLARE
  v_project_id UUID;
  v_rows_updated INT;
BEGIN
  -- Get the project_id from the investment
  SELECT project_id INTO v_project_id
  FROM investments
  WHERE id = p_investment_id AND investor_id = p_investor_id
  LIMIT 1;

  IF v_project_id IS NULL THEN
    RETURN jsonb_build_object('error', 'Investment not found');
  END IF;

  -- Update investment status to 'paid' (atomic)
  UPDATE investments
  SET status = 'paid'
  WHERE id = p_investment_id AND investor_id = p_investor_id;

  GET DIAGNOSTICS v_rows_updated = ROW_COUNT;

  IF v_rows_updated = 0 THEN
    RETURN jsonb_build_object('error', 'Failed to update investment');
  END IF;

  -- Update project's amount_raised (atomic)
  UPDATE projects
  SET amount_raised = COALESCE(amount_raised, 0) + p_amount
  WHERE id = v_project_id;

  RETURN jsonb_build_object('success', true, 'project_id', v_project_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Allow service role to call this function
GRANT EXECUTE ON FUNCTION confirm_investment TO service_role;
