-- ============================================================
-- Migration 010: Notifications
-- Description: All notification records across all channels
-- ============================================================

CREATE TABLE notifications (
  id          UUID                  NOT NULL DEFAULT uuid_generate_v4(),
  user_id     UUID                  NOT NULL,
  request_id  UUID,
  type        notification_type     NOT NULL,
  channel     notification_channel  NOT NULL,
  status      notification_status   NOT NULL DEFAULT 'PENDING',
  body        TEXT                  NOT NULL,
  metadata    JSONB                 NOT NULL DEFAULT '{}',
  sent_at     TIMESTAMPTZ,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ           NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_notifications         PRIMARY KEY (id),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notifications_request
    FOREIGN KEY (request_id) REFERENCES blood_requests(id) ON DELETE SET NULL,
  CONSTRAINT chk_sent_at_if_sent CHECK (
    (status IN ('SENT','DELIVERED','READ') AND sent_at IS NOT NULL)
    OR status IN ('PENDING','FAILED')
  ),
  CONSTRAINT chk_read_at_if_read CHECK (
    (status = 'READ' AND read_at IS NOT NULL)
    OR status != 'READ'
  )
);

-- User's unread notifications (most common query)
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

-- Request-level notifications (used by admin + requester views)
CREATE INDEX idx_notifications_request
  ON notifications(request_id, created_at DESC)
  WHERE request_id IS NOT NULL;

-- Channel + status for delivery monitoring
CREATE INDEX idx_notifications_status_channel
  ON notifications(status, channel, created_at DESC)
  WHERE status IN ('PENDING', 'FAILED');

COMMENT ON TABLE notifications IS 'Notification records for all channels: PUSH, SMS, WEBSOCKET, EMAIL';
COMMENT ON COLUMN notifications.metadata IS 'Channel-specific data: FCM message ID, Twilio SID, WebSocket room, etc.';
