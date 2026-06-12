-- ============================================================
-- Migration 008: Donor Responses
-- Description: Tracks donor accept/decline for each request
-- ============================================================

CREATE TABLE donor_responses (
  id            UUID          NOT NULL DEFAULT uuid_generate_v4(),
  donor_id      UUID          NOT NULL,  -- donor_profiles.id
  request_id    UUID          NOT NULL,
  action        donor_action  NOT NULL,
  responded_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_donor_responses         PRIMARY KEY (id),
  CONSTRAINT uq_donor_request           UNIQUE (donor_id, request_id),
  CONSTRAINT fk_donor_responses_donor
    FOREIGN KEY (donor_id) REFERENCES donor_profiles(id) ON DELETE CASCADE,
  CONSTRAINT fk_donor_responses_request
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE CASCADE
);

-- Request + action — used to count accepted donors per request
CREATE INDEX idx_donor_responses_request_action
  ON donor_responses(request_id, action);

-- Donor history — how many requests a donor accepted (response rate scoring)
CREATE INDEX idx_donor_responses_donor
  ON donor_responses(donor_id, responded_at DESC);

COMMENT ON TABLE donor_responses IS 'One row per donor-per-request response. UNIQUE constraint prevents double-accept.';
