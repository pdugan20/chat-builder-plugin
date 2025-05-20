import requiredFonts from '../constants/fonts';
import { MESSAGE_TYPE } from '../constants/messages';

export default async function loadFonts() {
  let areRequiredFontsAvailable = false;

  try {
    const fonts = await figma.listAvailableFontsAsync();
    areRequiredFontsAvailable = requiredFonts.every((requiredFont) =>
      fonts.some((font) => font.fontName.family === requiredFont.family && font.fontName.style === requiredFont.style)
    );

    if (areRequiredFontsAvailable) {
      await Promise.all(
        requiredFonts.map(async (requiredFont) => {
          const fontToLoad = fonts.find(
            (font) => font.fontName.family === requiredFont.family && font.fontName.style === requiredFont.style
          );
          if (fontToLoad) {
            try {
              await figma.loadFontAsync(fontToLoad.fontName);
            } catch (fontError) {
              areRequiredFontsAvailable = false;
            }
          }
        })
      );
    }
  } catch (err) {
    areRequiredFontsAvailable = false;
  }

  figma.ui.postMessage({
    type: MESSAGE_TYPE.HAS_FONTS,
    hasFonts: areRequiredFontsAvailable,
  });
}
