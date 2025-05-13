import requiredFonts from '../constants/fonts';

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
            await figma.loadFontAsync(fontToLoad.fontName);
          }
        })
      );
    }
  } catch (err) {
    //
  }
  figma.ui.postMessage({
    type: 'LOAD_REQUIRED_FONTS',
    hasFonts: areRequiredFontsAvailable,
  });
}
