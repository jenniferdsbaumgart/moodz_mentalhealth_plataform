# Notification Sounds

This directory contains audio files for notifications.

## Required Files

- `notification.mp3` - Main notification sound (short, pleasant chime)

## Recommended Specifications

- **Duration:** 0.5-1.5 seconds
- **Format:** MP3 (for broad browser support)
- **Sample Rate:** 44100 Hz
- **Bit Rate:** 128 kbps
- **Volume:** Normalised to -12 dB

## Free Sound Resources

You can find suitable notification sounds at:

1. **Freesound.org** - https://freesound.org/search/?q=notification
2. **Mixkit** - https://mixkit.co/free-sound-effects/notification/
3. **Zapsplat** - https://www.zapsplat.com/sound-effect-category/notifications/

## Usage

The notification sound is played via the `useNotificationsRealtime` hook when:
- A new in-app notification is received via Pusher
- The user has sound notifications enabled

Sound can be toggled via the `NotificationsProvider` context.

