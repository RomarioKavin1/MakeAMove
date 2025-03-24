// Modal z-index fix script
document.addEventListener("DOMContentLoaded", function () {
  // Function to initialize the modal iframe
  function initModalFrame() {
    const modalFrame = document.getElementById("modal-frame");
    if (!modalFrame || !(modalFrame instanceof HTMLIFrameElement)) return;

    // Get the iframe document
    const frameDoc =
      modalFrame.contentDocument || modalFrame.contentWindow?.document;
    if (!frameDoc) return;

    // Set up the iframe document
    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              width: 100vw;
              height: 100vh;
              pointer-events: none;
              background: transparent;
              font-family: sans-serif;
            }
            
            .modal-container {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              pointer-events: none;
            }
            
            .modal-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              backdrop-filter: blur(4px);
              pointer-events: auto;
              z-index: 1;
            }
            
            .modal-content {
              position: relative;
              z-index: 2;
              pointer-events: auto;
            }

            /* Pixel text */
            .pixel-text {
              font-family: monospace;
              letter-spacing: 0.05em;
              line-height: 1.5;
            }

            /* Arcade button */
            .arcade-btn {
              position: relative;
              transition: transform 0.1s ease;
              text-transform: uppercase;
            }

            /* Pixelated shadow */
            .pixelated-shadow {
              box-shadow: 6px 6px 0px #000, 6px 6px 0px 2px rgba(79, 70, 229, 0.5);
            }

            /* Pixel pattern */
            .pixel-pattern {
              background-color: #1a1a2e;
              background-image: 
                linear-gradient(rgba(79, 70, 229, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(79, 70, 229, 0.1) 1px, transparent 1px);
              background-size: 8px 8px;
              background-position: -1px -1px;
            }
          </style>
        </head>
        <body>
          <div id="modal-container" class="modal-container"></div>
          <script>
            // Handle clicks on modal buttons
            document.addEventListener('click', function(e) {
              // Close button
              if (e.target.closest('.close-modal-btn')) {
                window.parent.postMessage({ type: 'modalOverlayClicked' }, '*');
              }
              
              // Wallet option button
              if (e.target.closest('.wallet-option-btn')) {
                const button = e.target.closest('.wallet-option-btn');
                const walletId = button.getAttribute('data-wallet-id');
                window.parent.postMessage({ type: 'connectWallet', walletId }, '*');
              }
              
              // Copy address button
              if (e.target.closest('.wallet-copy-btn')) {
                window.parent.postMessage({ type: 'copyAddress' }, '*');
              }
              
              // Explorer button
              if (e.target.closest('.wallet-explorer-btn')) {
                window.parent.postMessage({ type: 'openExplorer' }, '*');
              }
              
              // Disconnect button
              if (e.target.closest('.wallet-disconnect-btn')) {
                window.parent.postMessage({ type: 'disconnectWallet' }, '*');
              }
            });
          </script>
        </body>
      </html>
    `);
    frameDoc.close();

    // Function to handle messages from the main window
    window.addEventListener("message", function (event) {
      if (event.data.type === "showModal") {
        showFrameModal(event.data.modalHTML);
      } else if (event.data.type === "hideModal") {
        hideFrameModal();
      }
    });

    // Functions to show/hide modal in the iframe
    function showFrameModal(modalHTML) {
      const frameDoc =
        modalFrame.contentDocument || modalFrame.contentWindow?.document;
      if (!frameDoc) return;

      const container = frameDoc.getElementById("modal-container");
      if (!container) return;

      // Make iframe receive pointer events
      modalFrame.style.pointerEvents = "auto";

      // Create modal elements
      container.innerHTML = `
        <div class="modal-overlay" id="modal-overlay"></div>
        <div class="modal-content">${modalHTML}</div>
      `;

      // Add click handler to overlay
      const overlay = frameDoc.getElementById("modal-overlay");
      if (overlay) {
        overlay.addEventListener("click", function () {
          window.postMessage({ type: "modalOverlayClicked" }, "*");
          hideFrameModal();
        });
      }
    }

    function hideFrameModal() {
      const frameDoc =
        modalFrame.contentDocument || modalFrame.contentWindow?.document;
      if (!frameDoc) return;

      const container = frameDoc.getElementById("modal-container");
      if (container) {
        container.innerHTML = "";
      }

      // Disable pointer events on iframe
      modalFrame.style.pointerEvents = "none";
    }
  }

  // Run iframe setup after a short delay
  setTimeout(initModalFrame, 500);

  // Set up communication between page and iframe
  window.showFrameModal = function (modalHTML) {
    window.postMessage({ type: "showModal", modalHTML }, "*");
  };

  window.hideFrameModal = function () {
    window.postMessage({ type: "hideModal" }, "*");
  };

  // Listen for messages from the iframe
  window.addEventListener("message", function (event) {
    if (event.data.type === "modalOverlayClicked") {
      // Find all close buttons/triggers and simulate clicks
      document
        .querySelectorAll(
          '[aria-label="Close"], .close-modal-btn, [data-dismiss="modal"]'
        )
        .forEach((el) => {
          if (el instanceof HTMLElement) {
            el.click();
          }
        });
    } else if (event.data.type === "connectWallet") {
      // Dispatch custom event to handle wallet connection
      document.dispatchEvent(
        new CustomEvent("iframe-connect-wallet", {
          detail: { walletId: event.data.walletId },
        })
      );
    } else if (event.data.type === "copyAddress") {
      document.dispatchEvent(new CustomEvent("iframe-copy-address"));
    } else if (event.data.type === "openExplorer") {
      document.dispatchEvent(new CustomEvent("iframe-open-explorer"));
    } else if (event.data.type === "disconnectWallet") {
      document.dispatchEvent(new CustomEvent("iframe-disconnect-wallet"));
    }
  });

  console.log("Modal iframe fix loaded");
});
