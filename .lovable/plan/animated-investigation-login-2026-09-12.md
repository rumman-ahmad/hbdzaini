# Animated Investigation Login

## What will change
- Add an animated first screen before the birthday investigation opens.
- Ask for the name and date of birth, with a clear example placeholder and the message “Enter your date of birth to access the investigation file.”
- Accept “Zainab Imran” regardless of uppercase or lowercase, and accept the birth date as either `15-09-2008` or `15092008`.
- Show a friendly animated error for incorrect details and an unlocking transition for correct details.
- Keep the existing eight birthday sections unchanged after access is granted.

## Technical details
- Validate both fields on the server so the correct birth date is not exposed in the page code.
- Store the unlocked state in a secure session so refreshing the page does not immediately lock it again.
- Add mobile-friendly sizing, accessible labels, keyboard submission, loading feedback, and reduced-motion support.
- Verify the entrance, invalid attempt, successful unlock, refresh persistence, and the existing birthday flow.
