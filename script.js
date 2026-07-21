/* ============================================================
   OneTap Multiple Customer Profiles
   Customer data is loaded from profiles.json
============================================================ */

/*
  This customer appears when the URL does not contain ?user=
*/
const DEFAULT_USERNAME = "basel";

/*
  Default image used when the customer's image does not exist.
*/
const DEFAULT_IMAGE = "images/default-profile.jpg";

/*
  Holds the selected customer information.
*/
let currentCustomer = null;

/*
  Toast timer.
*/
let toastTimer = null;

/* ============================================================
   GET HTML ELEMENTS
============================================================ */

const cardElement =
  document.getElementById("card");

const nameElement =
  document.getElementById("name");

const jobElement =
  document.getElementById("job");

const avatarElement =
  document.getElementById("avatar");

const actionsElement =
  document.getElementById("actions");

const toastElement =
  document.getElementById("toast");

const whatsappButton =
  document.getElementById("whatsappBtn");

const vodafoneCashButton =
  document.getElementById("vodafoneCashBtn");

const orderNowButton =
  document.getElementById("orderNowBtn");

const instapayButton =
  document.getElementById("instapayBtn");

const instapayLabel =
  document.getElementById("instapayLabel");

const facebookButton =
  document.getElementById("facebookBtn");

const instagramButton =
  document.getElementById("instagramBtn");

const tiktokButton =
  document.getElementById("tiktokBtn");

const xButton =
  document.getElementById("xBtn");

/* ============================================================
   LOAD PROFILES.JSON
============================================================ */

async function loadProfile() {
  try {
    /*
      Load the customers file.
    */
    const response =
      await fetch("profiles.json");

    /*
      Check whether the file loaded successfully.
    */
    if (!response.ok) {
      throw new Error(
        `Unable to load profiles.json. Status: ${response.status}`
      );
    }

    /*
      Convert the JSON response into a JavaScript object.
    */
    const profiles =
      await response.json();

    /*
      Get the customer username from the URL.

      Example:
      index.html?user=basel
    */
    const username =
      getUsernameFromUrl();

    /*
      Find the requested customer.
    */
    currentCustomer =
      profiles[username];

    /*
      Display an error when the customer does not exist.
    */
    if (!currentCustomer) {
      showProfileNotFound(username);
      return;
    }

    /*
      Display the customer's information.
    */
    renderProfile(currentCustomer);

    /*
      Connect buttons to the customer's links.
    */
    setupButtons(currentCustomer);

    /*
      Start the buttons animation.
    */
    animateVisibleButtons();

  } catch (error) {
    console.error(
      "Profile loading error:",
      error
    );

    showLoadingError();
  }
}

/* ============================================================
   GET USERNAME FROM URL
============================================================ */

function getUsernameFromUrl() {
  /*
    Read URL query parameters.
  */
  const parameters =
    new URLSearchParams(
      window.location.search
    );

  /*
    Get the value after ?user=
  */
  const requestedUsername =
    parameters.get("user");

  /*
    Use the default customer when no user is provided.
  */
  const username =
    requestedUsername ||
    DEFAULT_USERNAME;

  /*
    Convert username to lowercase and remove extra spaces.
  */
  return username
    .trim()
    .toLowerCase();
}

/* ============================================================
   DISPLAY PROFILE
============================================================ */

function renderProfile(profile) {
  /*
    Customer name.
  */
  nameElement.textContent =
    profile.name || "Customer";

  /*
    Customer job title.
  */
  jobElement.textContent =
    profile.job || "";

  /*
    Profile image.
  */
  avatarElement.src =
    profile.image || DEFAULT_IMAGE;

  avatarElement.alt =
    profile.name
      ? `${profile.name} profile picture`
      : "Profile picture";

  /*
    Use the default image if the selected image cannot be loaded.
  */
  avatarElement.onerror =
    function handleImageError() {
      /*
        Prevent an endless error loop.
      */
      this.onerror = null;

      this.src = DEFAULT_IMAGE;
    };

  /*
    Update the browser page title.
  */
  document.title =
    profile.name
      ? `${profile.name} | OneTap`
      : "OneTap Digital Profile";

  /*
    Change InstaPay text depending on whether
    the value is a link or a username.
  */
  if (isValidWebLink(profile.instapay)) {
    instapayLabel.textContent =
      "InstaPay";
  } else {
    instapayLabel.textContent =
      "InstaPay · Copy Username";
  }
}

/* ============================================================
   SETUP ALL BUTTONS
============================================================ */

function setupButtons(profile) {
  setupWhatsAppButton(
    profile.whatsapp
  );

  setupVodafoneCashButton(
    profile.vodafoneCash
  );

  setupOrderNowButton(
    profile.whatsapp,
    profile.orderMessage
  );

  setupInstaPayButton(
    profile.instapay
  );

  setupSocialButton(
    facebookButton,
    profile.facebook
  );

  setupSocialButton(
    instagramButton,
    profile.instagram
  );

  setupSocialButton(
    tiktokButton,
    profile.tiktok
  );

  setupSocialButton(
    xButton,
    profile.x
  );
}

/* ============================================================
   WHATSAPP BUTTON
============================================================ */

function setupWhatsAppButton(phoneNumber) {
  /*
    Hide the button if no phone number exists.
  */
  if (!phoneNumber) {
    hideButton(whatsappButton);
    return;
  }

  whatsappButton.addEventListener(
    "click",
    function openWhatsApp() {
      /*
        Convert the Egyptian number
        into international format.
      */
      const formattedNumber =
        formatWhatsAppNumber(
          phoneNumber
        );

      if (!formattedNumber) {
        showToast(
          "WhatsApp number is unavailable"
        );

        return;
      }

      openExternalLink(
        `https://wa.me/${formattedNumber}`
      );
    }
  );
}

/* ============================================================
   FORMAT EGYPTIAN PHONE NUMBER
============================================================ */

function formatWhatsAppNumber(phoneNumber) {
  /*
    Remove spaces, plus signs, and other characters.
  */
  let digits =
    String(phoneNumber)
      .replace(/\D/g, "");

  /*
    Example:
    01003232820
    becomes:
    201003232820
  */
  if (
    digits.startsWith("01") &&
    digits.length === 11
  ) {
    digits =
      `2${digits}`;
  }

  /*
    Example:
    00201003232820
    becomes:
    201003232820
  */
  if (digits.startsWith("0020")) {
    digits =
      digits.slice(2);
  }

  return digits;
}
/* ============================================================
   VODAFONE CASH BUTTON
============================================================ */

function setupVodafoneCashButton(phoneNumber) {
  /*
    Hide the button if there is no Vodafone Cash number.
  */
  if (!phoneNumber) {
    hideButton(vodafoneCashButton);
    return;
  }

  vodafoneCashButton.addEventListener(
    "click",
    async function handleVodafoneCash() {
      const cleanNumber =
        String(phoneNumber)
          .replace(/\D/g, "");

      if (!cleanNumber) {
        showToast(
          "Vodafone Cash number is unavailable"
        );

        return;
      }

      await copyVodafoneCashNumber(
        cleanNumber
      );
    }
  );
}

async function copyVodafoneCashNumber(phoneNumber) {
  try {
    await navigator.clipboard.writeText(
      phoneNumber
    );

    showToast(
      "Vodafone Cash number copied!"
    );

  } catch (error) {
    const temporaryInput =
      document.createElement("input");

    temporaryInput.value =
      phoneNumber;

    temporaryInput.style.position =
      "fixed";

    temporaryInput.style.opacity =
      "0";

    document.body.appendChild(
      temporaryInput
    );

    temporaryInput.select();

    temporaryInput.setSelectionRange(
      0,
      99999
    );

    document.execCommand("copy");

    document.body.removeChild(
      temporaryInput
    );

    showToast(
      "Vodafone Cash number copied!"
    );
  }
}
/* ============================================================
   ORDER NOW BUTTON
============================================================ */

function setupOrderNowButton(
  phoneNumber,
  orderMessage
) {
  /*
    Hide the button if there is no WhatsApp number.
  */
  if (!phoneNumber) {
    hideButton(orderNowButton);
    return;
  }

  orderNowButton.addEventListener(
    "click",
    function openOrderWhatsApp() {
      const formattedNumber =
        formatWhatsAppNumber(
          phoneNumber
        );

      if (!formattedNumber) {
        showToast(
          "WhatsApp number is unavailable"
        );

        return;
      }

      const message =
        orderMessage ||
        "السلام عليكم، أريد تنفيذ طلب من خلال B&S";

      const encodedMessage =
        encodeURIComponent(message);

      openExternalLink(
        `https://wa.me/${formattedNumber}?text=${encodedMessage}`
      );
    }
  );
}

/* ============================================================
   INSTAPAY BUTTON
============================================================ */

function setupInstaPayButton(value) {
  /*
    Hide the button if no InstaPay value exists.
  */
  if (!value) {
    hideButton(instapayButton);
    return;
  }

  instapayButton.addEventListener(
    "click",
    async function handleInstaPay() {
      /*
        Open it when it is a complete URL.
      */
      if (isValidWebLink(value)) {
        openExternalLink(value);
        return;
      }

      /*
        Copy it when it is a username or handle.
      */
      await copyText(value);
    }
  );
}

/* ============================================================
   SOCIAL BUTTON
============================================================ */

function setupSocialButton(
  button,
  url
) {
  /*
    Hide the button if the social link is empty.
  */
  if (!url) {
    hideButton(button);
    return;
  }

  button.addEventListener(
    "click",
    function openSocialLink() {
      openExternalLink(url);
    }
  );
}

/* ============================================================
   HIDE EMPTY BUTTON
============================================================ */

function hideButton(button) {
  if (!button) {
    return;
  }

  button.classList.add("hidden");
}

/* ============================================================
   OPEN EXTERNAL LINK
============================================================ */

function openExternalLink(url) {
  if (!url) {
    return;
  }

  window.open(
    url,
    "_blank",
    "noopener,noreferrer"
  );
}

/* ============================================================
   CHECK URL
============================================================ */

function isValidWebLink(value) {
  return /^https?:\/\//i.test(
    value || ""
  );
}

/* ============================================================
   COPY TEXT
============================================================ */

async function copyText(value) {
  try {
    /*
      Modern clipboard method.
    */
    await navigator.clipboard.writeText(
      value
    );

    showToast(
      "InstaPay username copied!"
    );

  } catch (error) {
    /*
      Alternative method for browsers
      that do not support navigator.clipboard.
    */
    const temporaryInput =
      document.createElement("input");

    temporaryInput.value =
      value;

    temporaryInput.style.position =
      "fixed";

    temporaryInput.style.opacity =
      "0";

    temporaryInput.style.pointerEvents =
      "none";

    document.body.appendChild(
      temporaryInput
    );

    temporaryInput.select();

    temporaryInput.setSelectionRange(
      0,
      99999
    );

    document.execCommand("copy");

    document.body.removeChild(
      temporaryInput
    );

    showToast(
      "InstaPay username copied!"
    );
  }
}

/* ============================================================
   BUTTON ANIMATION
============================================================ */

function animateVisibleButtons() {
  /*
    Select every visible button.
  */
  const visibleButtons =
    document.querySelectorAll(
      ".btn:not(.hidden)"
    );

  /*
    Add a delay to every button.
  */
  visibleButtons.forEach(
    function animateButton(
      button,
      index
    ) {
      button.style.animationDelay =
        `${0.5 + index * 0.11}s`;

      button.classList.add(
        "show-button"
      );
    }
  );
}

/* ============================================================
   TOAST MESSAGE
============================================================ */

function showToast(message) {
  toastElement.textContent =
    message;

  toastElement.classList.add(
    "show"
  );

  clearTimeout(toastTimer);

  toastTimer =
    setTimeout(
      function hideToast() {
        toastElement.classList.remove(
          "show"
        );
      },
      1800
    );
}

/* ============================================================
   PROFILE NOT FOUND
============================================================ */

function showProfileNotFound(username) {
  cardElement.classList.add(
    "error-card"
  );

  nameElement.textContent =
    "Profile not found";

  jobElement.textContent =
    `No customer named "${username}" exists in profiles.json`;

  document.title =
    "Profile Not Found";
}

/* ============================================================
   JSON LOADING ERROR
============================================================ */

function showLoadingError() {
  cardElement.classList.add(
    "error-card"
  );

  nameElement.textContent =
    "Unable to load profile";

  jobElement.textContent =
    "Open the project using Live Server, not by double-clicking index.html.";

  actionsElement.style.display =
    "none";

  document.title =
    "Profile Loading Error";
}

/* ============================================================
   START APPLICATION
============================================================ */

loadProfile();
