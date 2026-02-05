// Utility to play notification sound
let notificationAudio: HTMLAudioElement | null = null;

export const playNotificationSound = () => {
  try {
    if (!notificationAudio) {
      notificationAudio = new Audio('/notification.mp3');
      notificationAudio.volume = 0.5;
    }
    
    // Clone and play to allow overlapping sounds
    const sound = notificationAudio.cloneNode() as HTMLAudioElement;
    sound.volume = 0.5;
    sound.play().catch(err => {
      console.log('Could not play notification sound:', err);
    });
  } catch (error) {
    console.log('Error playing notification sound:', error);
  }
};
