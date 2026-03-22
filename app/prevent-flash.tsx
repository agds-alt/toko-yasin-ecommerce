export function PreventFlashStyle() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Prevent white flash on initial load - Critical CSS */
            html {
              background: linear-gradient(135deg, #1a2b4a 0%, #2a3b5a 100%) !important;
            }

            body {
              background: transparent !important;
              min-height: 100vh;
            }

            /* Prevent white background on any element during initial load */
            #__next {
              background: transparent;
            }
          `,
        }}
      />
    </>
  );
}
