 (function () {
  // Mapbox configuration
  const mapboxToken = "pk.eyJ1IjoibWF4aW1nbG9iaW8iLCJhIjoiY205ZTV1Z3Q0MTJuZjJrczduaWpmczFxOSJ9.uxg6_dvAoTHfmhAicl9pjA";

  // Initialize map
  function initializeMap(lat, lon) {
    if (typeof mapboxgl === 'undefined') {
      setTimeout(() => initializeMap(lat, lon), 1000);
      return;
    }

    mapboxgl.accessToken = mapboxToken;
    const map = new mapboxgl.Map({
      container: 'dynamic-map',
      style: 'mapbox://styles/mapbox/light-v10',
      center: [lon, lat],
      zoom: 5.5,
      projection: 'globe',
      interactive: false
    });

    map.on('style.load', () => {
      map.setFog({
        color: 'white',
        'high-color': '#add8e6',
        'horizon-blend': 0.2,
        'space-color': '#dfefff',
        'star-intensity': 0.0
      });
    });
  }

  // Geocode location
  function geocodeLocation(query, callback) {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          callback(lat, lon);
        } else {
          fallbackLocation(callback);
        }
      })
      .catch(() => fallbackLocation(callback));
  }

  // Fallback location
  function fallbackLocation(callback) {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        const lat = data.latitude;
        const lon = data.longitude;
        window.userLocation = `${data.city}, ${data.country_name}`;
        callback(lat, lon);
      })
      .catch(() => {
        window.userLocation = 'Alanya, Turkey';
        callback(36.5438, 32.0060);
      });
  }

  // Load map
  function loadMap() {
    const manualLocation = localStorage.getItem("userLocation");
    if (manualLocation) {
      geocodeLocation(manualLocation, initializeMap);
    } else {
      fallbackLocation(initializeMap);
    }
  }

  // Function to load user data from Xano
  function loadUserDataFromXano(userId) {
    fetch(`https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users/${userId}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {

        // Update user avatar (for map avatar, progress bar, and levels popup)
        if (data.picture) {
          const userAvatar = document.getElementById('user-avatar');
          const progressAvatar = document.getElementById('progress-avatar');
          const levelsAvatar = document.getElementById('levels-avatar');


          // Construct full URL for avatar
          const avatarUrl = data.picture.startsWith('http') ? data.picture : `https://xu8w-at8q-hywg.n7d.xano.io${data.picture}`;

          // Update map avatar
          if (userAvatar) {
            userAvatar.src = avatarUrl;
            userAvatar.onerror = function() {
              this.src = 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6883c7a80506f986b2f7ddb7_db85210bbfb795678a1578319074aaf4_placeholder.svg';
            };
            userAvatar.onload = function() {
            };
          } else {
          }

          // Update progress bar avatar
          if (progressAvatar) {
            progressAvatar.src = avatarUrl;
            progressAvatar.onerror = function() {
              this.src = 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6883c7a80506f986b2f7ddb7_db85210bbfb795678a1578319074aaf4_placeholder.svg';
            };
            progressAvatar.onload = function() {
            };
          } else {
          }

          // Update levels popup avatar
          if (levelsAvatar) {
            levelsAvatar.src = avatarUrl;
            levelsAvatar.onerror = function() {
              this.src = 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6883c7a80506f986b2f7ddb7_db85210bbfb795678a1578319074aaf4_placeholder.svg';
            };
            levelsAvatar.onload = function() {
            };
          } else {
          }
        } else {
        }

        // Update user name
        if (data.name) {
          const userMenuName = document.getElementById('user-menu-name');
          const dropdownUserName = document.getElementById('dropdown-user-name');


          if (userMenuName) {
            userMenuName.textContent = data.name;
          } else {
          }

          if (dropdownUserName) {
            dropdownUserName.textContent = data.name;
          } else {
          }
        } else {
        }

        // Update user email
        if (data.email) {

          // Try multiple selectors
          const emailElement1 = document.querySelector('#dropdown-user-email span');
          const emailElement2 = document.querySelector('.user-email span');
          const emailElement3 = document.getElementById('dropdown-user-email');


          let targetElement = emailElement1 || emailElement2;

          if (targetElement) {
            targetElement.textContent = data.email;
          } else           if (emailElement3) {
            emailElement3.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4L8 9L14 4M2 4C2 3.44772 2.44772 3 3 3H13C13.5523 3 14 3.44772 14 4V12C14 12.5523 13.5523 13 13 13H3C2.44772 13 2 12.5523 2 12V4Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>${data.email}</span>
            `;

            // Force update with delay to ensure DOM is ready
            setTimeout(() => {
              const finalCheck = document.getElementById('dropdown-user-email');
              if (finalCheck) {
              }
            }, 100);
          } else {
          }
        } else {
        }
      })
      .catch(error => {
      });
  }

  // User profile functionality
  function initializeUserProfile() {
    try {
      // Load user data from Xano
      const authRaw = localStorage.getItem('auth');

      // Try other possible keys
      const authRaw2 = localStorage.getItem('user');
      const authRaw3 = localStorage.getItem('userData');
      const authRaw4 = localStorage.getItem('xano_auth');
      const userId = localStorage.getItem('userId');

      // Use userId directly if available
      if (userId) {
        loadUserDataFromXano(userId);
      } else if (authRaw) {
        try {
          const auth = JSON.parse(authRaw);
          const userId = auth.id;
          if (userId) {
            loadUserDataFromXano(userId);
          }
        } catch (e) {
        }
      }
    } catch (error) {
    }
  }

  // Location functionality
  function initializeLocation() {

    function updateLocationUI(value) {
      const locationText = value || "your place";
      window.userLocation = locationText;

      // Update the entire location-text structure to maintain proper styling
      const locationTextContainer = document.getElementById('location-text');
      if (locationTextContainer) {
        locationTextContainer.innerHTML = `
          <span class="location-prefix">Feel at Home in</span>
          <span id="location-clickable">
            <span id="location-detect" class="location-name">${locationText}</span>
            <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6826567e4c85159257ae5e4e_811a212cf32b6b680a0b472b1a82f601_edit%202-dark.svg" alt="Edit icon" />
          </span>
        `;

        // Re-attach event listener to the new location-clickable element
        const newLocationClickable = locationTextContainer.querySelector('#location-clickable');
        if (newLocationClickable) {
          newLocationClickable.addEventListener('click', showLocationPrompt);
        }
      }
    }

    function showLocationPrompt() {
      // Open our custom location modal instead of system prompt
      const locationModal = document.getElementById('location-modal');
      if (locationModal) {
        locationModal.classList.add('show');
        // Focus on input field
        const locationInput = document.getElementById('location-input');
        if (locationInput) {
          locationInput.focus();
        }
      }
    }

    // Event listeners
    document.getElementById('location-clickable').addEventListener('click', showLocationPrompt);
    document.getElementById('mobile-pin').addEventListener('click', showLocationPrompt);



    // Load saved location or detect automatically
    const savedLocation = localStorage.getItem("userLocation");
    if (savedLocation) {
      updateLocationUI(savedLocation);
    } else {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          const auto = data.city && data.country_name
            ? `${data.city}, ${data.country_name}`
            : data.city || data.country_name || "your place";
          localStorage.setItem("userLocation", auto);
          updateLocationUI(auto);
        })
        .catch(() => {
          updateLocationUI("your place");
        });
    }
  }

  // User dropdown functionality
  function initializeUserDropdown() {
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');

    // Toggle dropdown
    userMenuButton.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!userMenuButton.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        userDropdown.classList.remove('show');
      }
    });
  }

  // My Context modal functionality
  function initializeMyContextModal() {
    const myContextBtn = document.getElementById('my-context-btn');
    const myContextModal = document.getElementById('my-context-modal');
    const closeModalBtn = document.getElementById('close-my-context-modal');
    const saveBtn = document.getElementById('save-context-btn');
    const userDropdown = document.getElementById('user-dropdown');

    // Load saved context
    const hasKids = localStorage.getItem('hasKids') === 'true';
    const hasPets = localStorage.getItem('hasPets') === 'true';
    const hasCar = localStorage.getItem('hasCar') === 'true';


    document.getElementById('has-kids').checked = hasKids;
    document.getElementById('has-pets').checked = hasPets;
    document.getElementById('has-car').checked = hasCar;


    // Open modal
    myContextBtn.addEventListener('click', () => {
      userDropdown.classList.remove('show');
      myContextModal.classList.add('show');
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
      myContextModal.classList.remove('show');
    });

    // Close modal when clicking outside
    myContextModal.addEventListener('click', (e) => {
      if (e.target === myContextModal) {
        myContextModal.classList.remove('show');
      }
    });

    // Save context
    saveBtn.addEventListener('click', () => {
      const hasKids = document.getElementById('has-kids').checked;
      const hasPets = document.getElementById('has-pets').checked;
      const hasCar = document.getElementById('has-car').checked;


      localStorage.setItem('hasKids', hasKids);
      localStorage.setItem('hasPets', hasPets);
      localStorage.setItem('hasCar', hasCar);


      myContextModal.classList.remove('show');

      // Show success message
      showContextSuccessTooltip();
    });
  }

  // Helper function to update location UI from modal
  function updateLocationUIFromModal(locationName) {
    window.userLocation = locationName;

    // Update the entire location-text structure to maintain proper styling
    const locationTextContainer = document.getElementById('location-text');
    if (locationTextContainer) {
      locationTextContainer.innerHTML = `
        <span class="location-prefix">Feel at Home in</span>
        <span id="location-clickable">
          <span id="location-detect" class="location-name">${locationName}</span>
          <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6826567e4c85159257ae5e4e_811a212cf32b6b680a0b472b1a82f601_edit%202-dark.svg" alt="Edit icon" />
        </span>
      `;

      // Re-attach event listener to the new location-clickable element
      const newLocationClickable = locationTextContainer.querySelector('#location-clickable');
      if (newLocationClickable) {
        newLocationClickable.addEventListener('click', () => {
          const locationModal = document.getElementById('location-modal');
          if (locationModal) {
            locationModal.classList.add('show');
            const locationInput = document.getElementById('location-input');
            if (locationInput) {
              locationInput.focus();
            }
          }
        });
      }
    }
  }

  // Location Modal functionality
  function initializeLocationModal() {
    const locationModal = document.getElementById('location-modal');
    const closeLocationModal = document.getElementById('close-location-modal');
    const locationInput = document.getElementById('location-input');
    const locationIcon = document.querySelector('.location-modal-icon');

    const locationDetectBtn = document.getElementById('location-detect-btn');
    const locationResults = document.getElementById('location-results');

    // Handle input changes to show/hide location icon
    if (locationInput && locationIcon) {
      locationInput.addEventListener('input', () => {
        if (locationInput.value.trim().length > 0) {
          locationIcon.classList.add('hidden');
        } else {
          locationIcon.classList.remove('hidden');
        }
      });
    }

    // Open location modal when clicking on location section
    const locationClickable = document.getElementById('location-clickable');
    if (locationClickable) {
      locationClickable.addEventListener('click', () => {
        locationModal.classList.add('show');
        locationInput.focus();
      });
    }

    // Close modal functions
    function closeModal() {
      locationModal.classList.remove('show');
      locationInput.value = '';
      locationResults.innerHTML = '';
      // Show location icon again when modal is closed
      if (locationIcon) {
        locationIcon.classList.remove('hidden');
      }
    }

    closeLocationModal.addEventListener('click', closeModal);

    // Close modal when clicking outside
    locationModal.addEventListener('click', (e) => {
      if (e.target === locationModal) {
        closeModal();
      }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && locationModal.classList.contains('show')) {
        closeModal();
      }
    });

    // Search location functionality
    async function searchLocation(query) {
      if (!query.trim()) return;

      // Show loading state with spinner only
      locationResults.innerHTML = '<div class="location-result-item loading"><div class="location-spinner"></div></div>';

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();

        displayLocationResults(data);
      } catch (error) {
        locationResults.innerHTML = '<div class="location-result-item error"><div class="location-error-icon"><img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6889eb961e515115851948da_9c301540e2805651f3355e19910b6585_pin-2.svg" alt="Error" width="20" height="20"></div><div class="location-content"><div class="location-name">Search error</div><div class="location-details">Please try again</div></div></div>';
      }
    }

    // Display search results
    function displayLocationResults(results) {
      if (results.length === 0) {
        locationResults.innerHTML = '<div class="location-result-item no-results"><div class="location-icon"><img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6889eb961e515115851948da_9c301540e2805651f3355e19910b6585_pin-2.svg" alt="Location" width="20" height="20"></div><div class="location-content"><div class="location-name">No locations found</div><div class="location-details">Try a different search term</div></div></div>';
        return;
      }

      locationResults.innerHTML = results.map(result => {
        const displayName = result.display_name.split(', ').slice(0, 2).join(', ');
        return `
          <div class="location-result-item" data-lat="${result.lat}" data-lon="${result.lon}" data-display-name="${result.display_name}">
            <div class="location-icon"><img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6889eb961e515115851948da_9c301540e2805651f3355e19910b6585_pin-2.svg" alt="Location" width="20" height="20"></div>
            <div class="location-content">
              <div class="location-name">${displayName}</div>
              <div class="location-details">${result.display_name}</div>
            </div>
          </div>
        `;
      }).join('');

      // Add click handlers to results (use event delegation to avoid multiple handlers)
      if (!locationResults.hasAttribute('data-handler-attached')) {
        locationResults.setAttribute('data-handler-attached', 'true');
        locationResults.addEventListener('click', (e) => {
          const item = e.target.closest('.location-result-item');
          if (!item) return;

          const lat = item.dataset.lat;
          const lon = item.dataset.lon;
          let displayName = item.dataset.displayName;

          // Limit to city and country only
          const parts = displayName.split(', ');
          if (parts.length > 2) {
            // Take city and country, skip detailed address
            const city = parts[0];
            const country = parts[parts.length - 1];
            displayName = `${city}, ${country}`;
          }

          // Update user location
          localStorage.setItem('userLocation', displayName);

          // Close modal immediately
          closeModal();

          // Show location success message
          showLocationSuccessTooltip();

          console.log('ssss');

          debugger

          // Reload page to update the map with new location
          setTimeout(() => {
            location.reload();
          }, 1000);
        });
      }
    }

    // Show autosuggest based on input
    locationInput.addEventListener('input', () => {
      const query = locationInput.value.trim();

      if (query) {
        // Show autosuggest after 300ms delay to avoid too many API calls
        clearTimeout(window.autosuggestTimeout);
        window.autosuggestTimeout = setTimeout(() => {
          if (query.length >= 2) { // Only search if 2+ characters
            searchLocation(query);
          }
        }, 300);
      } else {
        // Clear results when input is empty
        locationResults.innerHTML = '';
      }
    });

    // Search on Enter key
    locationInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = locationInput.value.trim();
        if (query) {
          searchLocation(query);
        }
      }
    });

    // Search on blur (when input loses focus)
    locationInput.addEventListener('blur', () => {
      const query = locationInput.value.trim();
      if (query && query.length >= 2) {
        searchLocation(query);
      }
    });

    // Use current location
    locationDetectBtn.addEventListener('click', async () => {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          const { latitude, longitude } = position.coords;

          // Reverse geocode to get location name
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
          const data = await response.json();

          if (data.display_name) {
            // Limit to city and country only
            let locationName = data.display_name;
            const parts = locationName.split(', ');
            if (parts.length > 2) {
              // Take city and country, skip detailed address
              const city = parts[0];
              const country = parts[parts.length - 1];
              locationName = `${city}, ${country}`;
            }

            localStorage.setItem('userLocation', locationName);

            // Close modal immediately
            closeModal();
            showLocationSuccessTooltip();

            // Reload page to update the map with new location
            setTimeout(() => {
              location.reload();
            }, 1000);
          }
        } catch (error) {
          showLocationErrorTooltip('Could not get your current location. Please try searching manually.');
        }
      } else {
        showLocationErrorTooltip('Geolocation is not supported by this browser.');
      }
    });
  }

  // Logout functionality
  function initializeLogout() {
    const logoutBtn = document.getElementById('logout-btn');

    if (logoutBtn) {
      logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();
        performLogout();
      });
    }
  }

  // Comprehensive logout function
  function performLogout() {

    // Close dropdown if open
    const userDropdown = document.querySelector('.user-dropdown');
    if (userDropdown) {
      userDropdown.classList.remove('show');
    }

    // Clear all authentication data
    localStorage.removeItem('auth');
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('xano_auth');
    localStorage.removeItem('reloadAccountOnce');
    localStorage.removeItem('justReloaded');

    // Clear user-specific data (optional - depends on your needs)
    // localStorage.removeItem('savedCards');
    // localStorage.removeItem('completedCards');
    // localStorage.removeItem('publicCards');


    // Redirect to login page or home
    window.location.href = 'https://globio.io/one-thing';
  }

  // Initialize everything when DOM is ready
  function initializeEverything() {
    loadMap();
    initializeUserProfile();
    initializeLocation();
    initializeUserDropdown();
    initializeMyContextModal();
    initializeLocationModal();
    initializeLogout();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEverything);
  } else {
    initializeEverything();
  }

  // Global context getter for One Thing generation
  window.getUserContext = () => {
    return {
      location: window.userLocation || 'your place',
      hasKids: localStorage.getItem('hasKids') === 'true',
      hasPets: localStorage.getItem('hasPets') === 'true',
      hasCar: localStorage.getItem('hasCar') === 'true'
    };
  }

  // OAuth Configuration
  var login_path = "/one-thing"
  var redirect_uri = "https://my.globio.io/oauth/account"
  var xano_oauth_init_url = "https://xu8w-at8q-hywg.n7d.xano.io/api:U0aE1wpF/oauth/google/init"
  var xano_oauth_continue_url = "https://xu8w-at8q-hywg.n7d.xano.io/api:U0aE1wpF/oauth/google/continue"
  var formHeaders = [];
  var formResponse = [];
  var authState = false;

  // OAuth Functions
  function initOauth() {
    var fetchURL = new URL(xano_oauth_init_url);
    fetchURL.searchParams.set("redirect_uri", redirect_uri);
    fetchURL = fetchURL.toString();

    fetch(fetchURL, {
        headers: formHeaders,
        method: "GET"
    })
    .then(res => res.json())
    .then(data => formResponse = data)
    .then(() => loginResponse(formResponse))
    .catch((error) => {
    });
  }

  function loginResponse(res) {
    window.location.href = res.authUrl
  }

  function continueOauth(code) {
    var fetchURL = new URL(xano_oauth_continue_url);
    fetchURL.searchParams.set("redirect_uri", redirect_uri);
    fetchURL.searchParams.set("code", code);

    fetchURL = fetchURL.toString();

    fetch(fetchURL, {
        headers: formHeaders,
        method: "GET"
    })
    .then(res => res.json())
    .then(data => formResponse = data)
    .then(() => saveToken(formResponse))
    .catch((error) => {
    });
  }

  function saveToken(res) {
    window.localStorage.setItem('auth', JSON.stringify(res));
    window.localStorage.setItem('reloadAccountOnce', 'true');
    updateAuthState(res);
  }

  function updateAuthState(res) {
    // Update UI with user data
    if (res.name && document.getElementById('user-name')) {
      document.getElementById('user-name').textContent = res.name;
    }
    if (res.email && document.getElementById('user-email')) {
      document.getElementById('user-email').textContent = res.email;
    }
    if (res.picture && document.getElementById('user-photo')) {
      document.getElementById('user-photo').src = res.picture;
    }

    // Set userId for the app
    if (res.id) {
      localStorage.setItem('userId', res.id);
    }
  }

  // OAuth Event Handlers
  document.addEventListener("click", function(event) {
    if (event.target.classList.contains("authButton")) {
      event.preventDefault();
      initOauth();
    }
  });

  // Legacy logout handler (keeping for compatibility)
  var logoutButton = document.querySelector("#logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      performLogout();
    });
  }

  // Auto Reload After Authentication
  (function() {
    // Если только что был reload — ничего не делаем, сбрасываем флаг
    if (localStorage.getItem('justReloaded')) {
      localStorage.removeItem('justReloaded');
      return;
    }

    let alreadyReloaded = false;

    function pollAuthToken() {
      if (alreadyReloaded) return;
      const authRaw = localStorage.getItem('auth');
      if (authRaw) {
        alreadyReloaded = true;
        localStorage.setItem('justReloaded', 'true');
        location.reload();
      } else {
        setTimeout(pollAuthToken, 200); // Проверяем каждые 200мс
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      pollAuthToken();
    });

    // Сбросить флаг при логауте
    window.addEventListener('storage', function(e) {
      if (e.key === 'auth' && !e.newValue) {
        localStorage.removeItem('justReloaded');
      }
    });
  })();

  // Handle OAuth Callback on Page Load
  window.addEventListener('load', function() {
    var curUrl = new URL(document.location.href);
    var code = curUrl.searchParams.get("code");
    if (code) {

      // Immediately clean URL to hide OAuth parameters from user
      var cleanUrl = new URL(document.location.href);
      cleanUrl.searchParams.delete("code");
      cleanUrl.searchParams.delete("scope");
      cleanUrl.searchParams.delete("authuser");
      cleanUrl.searchParams.delete("hd");
      cleanUrl.searchParams.delete("prompt");
      history.replaceState(null, "", cleanUrl.toString());

      continueOauth(code);
    } else {
      var token = window.localStorage.getItem('auth');
      if (token) {
        try {
          token = JSON.parse(token);
          if (token) {
            updateAuthState(token);
          }
        } catch (e) {
        }
      }

      if (!token && curUrl.pathname.indexOf('account') !== -1) {
        document.location.href = login_path;
      }
    }
  });

  const API_SUGGEST = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/get_card';
  const API_SAVE = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users_cards';
  const API_USERS = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users';
  const API_SET_CARD_PUBLISH = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/set_card_param'
  const API_SET_CARD_UPLOAD_IMAGE = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/upload/image'
  const MAX_ATTEMPTS = 3;
  const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

  let attemptsLeft = parseInt(localStorage.getItem('attemptsLeftAccount')) || MAX_ATTEMPTS;
  let resetTime = parseInt(localStorage.getItem('resetTimeAccount')) || getMidnightTimestamp();
//    let savedCards = JSON.parse(localStorage.getItem('savedCards')) || [];

  var savedCards = [];
  var completedCards = [];
  var publicCards = [];

  const savedButton = document.querySelector('button[data-filter="saved"]');
  const completedButton = document.querySelector('button[data-filter="completed"]');
  const communityButton = document.querySelector('button[data-filter="community"]');

  var uploadFileName = '';


  // Function to ensure userId is set in localStorage
  function ensureUserId() {
    let userId = localStorage.getItem('userId');

    if (!userId) {
      // Try to get from auth object
      const auth = localStorage.getItem('auth');
      if (auth) {
        try {
          const authObj = JSON.parse(auth);
          if (authObj.id) {
            userId = authObj.id;
            localStorage.setItem('userId', userId);
          }
        } catch (e) {
        }
      }
    }

    return userId;
  }








  let currentSuggestion = null;
  let currentCategoryFilter = localStorage.getItem('currentCategoryFilter') || 'all';
  let currentTypeFilter = localStorage.getItem('currentTypeFilter') || 'saved';

  const btn = document.getElementById('one-thing-btn');
  const attemptsCounter = document.getElementById('attempts-counter');
  const popup = document.getElementById('one-thing-popup');
  const popupTitle = document.getElementById('popup-title');
  const popupDesc = document.getElementById('popup-desc');
  const btnSave = document.getElementById('popup-save');
  const btnSkip = document.getElementById('popup-skip');
  const cardList = document.getElementById('one-thing-card-list');
  const filterButtons = document.querySelectorAll('.filter-buttons button');
  const filterButtonsDropdown = document.querySelectorAll('.filter-buttons dropdown-container button');
  const filterButtonsGroup = document.querySelectorAll('.filter-buttons .filter-group button');





  // Ensure userId is set через 5 сек
  setTimeout(() => {
    ensureUserId();
  }, 5000);


  updateCounterUI();

  // Restore active state for filter buttons
//    filterButtons.forEach(btn => {
//      btn.classList.remove('active');
//      if (btn.getAttribute('data-filter') === currentTypeFilter) {
//        btn.classList.add('active');
//      }
//    });

  // Remove active class from all filter buttons first
  filterButtons.forEach(btn => {
    btn.classList.remove('active');
  });

  // Set active class based on currentTypeFilter
  filterButtons.forEach(btn => {
    if (btn.getAttribute('data-filter') === currentTypeFilter) {
      btn.classList.add('active');
    }
  });

  // Load appropriate cards based on current filter
  if (currentTypeFilter === 'saved') {
      loadSavedUserCards();
  }
  if (currentTypeFilter === 'completed') {
      loadCompletedUserCards();
  }
  if (currentTypeFilter === 'community') {
      loadCommunityUserCards();
  }

  renderCardList(currentTypeFilter, currentCategoryFilter); // Start with saved cards by default

  // Initialize dropdown functionality
  initializeDropdown();

  // PROGRESS BAR COMPONENT JS - START (can be easily removed)
  // Progress Bar and Levels System
  const levels = [
    { level: 1, name: "Explorer", xp: 0, description: "Just starting your journey" },
    { level: 2, name: "Adventurer", xp: 100, description: "Taking your first steps" },
    { level: 3, name: "Discoverer", xp: 250, description: "Finding your way around" },
    { level: 4, name: "Explorer", xp: 500, description: "Getting comfortable with exploration" },
    { level: 5, name: "Navigator", xp: 1000, description: "Confidently exploring new places" },
    { level: 6, name: "Pioneer", xp: 2000, description: "Leading the way for others" },
    { level: 7, name: "Trailblazer", xp: 4000, description: "Creating new paths" },
    { level: 8, name: "Master Explorer", xp: 8000, description: "Expert in exploration" },
    { level: 9, name: "Legend", xp: 15000, description: "A true exploration legend" },
    { level: 10, name: "Myth", xp: 30000, description: "The ultimate exploration myth" }
  ];

  let userXP = 0;
  let currentLevel = 1;

  // Calculate user XP based on activities
  function calculateUserXP() {
    const savedCount = savedCards.length;
    const completedCount = completedCards.length;
    const publicCount = completedCards.filter(card => card.published).length;


    // XP calculation: 10 for saved, 25 for completed, 50 for public
    userXP = (savedCount * 10) + (completedCount * 25) + (publicCount * 50);


    // Find current level
    for (let i = levels.length - 1; i >= 0; i--) {
      if (userXP >= levels[i].xp) {
        currentLevel = levels[i].level;
        break;
      }
    }


    return { xp: userXP, level: currentLevel };
  }




  // Initialize progress tabs
  function initializeProgressTabs() {
    const localTab = document.getElementById('local-tab');
    const globalTab = document.getElementById('global-tab');

    if (!localTab || !globalTab) return;

    // Set default to local
    localTab.classList.add('active');
    globalTab.classList.remove('active');
    updateTabDescription('local');

    // Tab click handlers
    localTab.addEventListener('click', () => {
      localTab.classList.add('active');
      globalTab.classList.remove('active');
      updateTabDescription('local');
      updateProgressDisplay('local');
    });

    globalTab.addEventListener('click', () => {
      globalTab.classList.add('active');
      localTab.classList.remove('active');
      updateTabDescription('global');
      updateProgressDisplay('global');
    });
  }

  // Update tab description based on selected tab
  function updateTabDescription(tabType) {
    const descriptionText = document.getElementById('tab-description-text');
    if (!descriptionText) return;

    if (tabType === 'local') {
      descriptionText.textContent = 'Progress in your current location';
    } else if (tabType === 'global') {
      descriptionText.textContent = 'Total progress across all locations';
    }
  }

  // Update dynamic visual based on level
  function updateDynamicVisual(level) {
    const dynamicVisual = document.getElementById('dynamic-visual');
    if (!dynamicVisual) return;

    // Define visual URLs for different levels
    const visualUrls = {
      1: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68bfe28c396f3faca6234db5_adaptio.svg',
      2: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68bfe28c396f3faca6234db5_adaptio.svg', // Will be updated later
      3: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68bfe28c396f3faca6234db5_adaptio.svg', // Will be updated later
      4: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68bfe28c396f3faca6234db5_adaptio.svg'  // Will be updated later
    };

    // Update visual source
    if (visualUrls[level]) {
      dynamicVisual.src = visualUrls[level];
    }
  }

  // Update progress display based on selected tab
  function updateProgressDisplay(tabType) {
    const progress = calculateUserXP();
    const currentLevelData = levels.find(l => l.level === progress.level);
    const nextLevelData = levels.find(l => l.level === progress.level + 1);

    if (!currentLevelData) return;

    // For now, we'll use the same logic for both tabs
    // In the future, you can implement different logic for local vs global
    const userXP = progress.xp;
    
    // Update level badge in profile menu
    const levelBadge = document.getElementById('user-level-badge');
    if (levelBadge) {
      levelBadge.textContent = currentLevelData.name;
    }

    // Update dynamic visual based on level
    updateDynamicVisual(currentLevelData.level);

    // Update circular progress
    const progressRing = document.querySelector('.progress-ring-circle');
    if (progressRing) {
      const progressPercent = nextLevelData ?
        Math.min(((userXP - currentLevelData.xp) / (nextLevelData.xp - currentLevelData.xp)) * 100, 100) :
        100;
      const circumference = 2 * Math.PI * 35; // radius = 35
      const offset = circumference - (progressPercent / 100) * circumference;
      progressRing.style.strokeDashoffset = offset;
    }
  }

  // Initialize levels popup
  function initializeLevelsPopup() {
    const levelsPopup = document.getElementById('levels-popup');
    const levelsClose = document.getElementById('levels-close');

    if (!levelsPopup || !levelsClose) {
      return;
    }

    // Get current user progress
    const progress = calculateUserXP();
    const currentLevel = progress.level;
    const userXP = progress.xp;


    // Populate levels list
    const levelsList = document.getElementById('levels-list');
    if (levelsList) {
      levelsList.innerHTML = '';

      levels.forEach(level => {
        const levelItem = document.createElement('div');
        levelItem.className = 'level-item';

        if (level.level === currentLevel) {
          levelItem.classList.add('current');
        } else if (level.level < currentLevel) {
          levelItem.classList.add('completed');
        }

        const nextLevel = levels.find(l => l.level === level.level + 1);
        const xpRequired = nextLevel ? nextLevel.xp - level.xp : 0;

        levelItem.innerHTML = `
          <div class="level-avatar" style="background: ${level.level <= currentLevel ? '#B1E530' : '#ccc'}">
            ${level.level}
          </div>
          <div class="level-details">
            <div class="level-name">${level.name}</div>
            <div class="level-description">${level.description}</div>
          </div>
          <div class="level-xp">${xpRequired} XP</div>
        `;

        levelsList.appendChild(levelItem);
      });

    }

    // Update current level info
    const currentLevelData = levels.find(l => l.level === currentLevel);
    const nextLevelData = levels.find(l => l.level === currentLevel + 1);

    if (currentLevelData) {
      // Update level badge in profile menu
      const levelBadge = document.getElementById('user-level-badge');
      if (levelBadge) {
        levelBadge.textContent = currentLevelData.name;
      }

      // Update dynamic visual based on level
      updateDynamicVisual(currentLevelData.level);

      // Update circular progress
      const progressRing = document.querySelector('.progress-ring-circle');
      if (progressRing) {
        const progressPercent = nextLevelData ?
          Math.min(((userXP - currentLevelData.xp) / (nextLevelData.xp - currentLevelData.xp)) * 100, 100) :
          100;
        const circumference = 2 * Math.PI * 35; // radius = 35
        const offset = circumference - (progressPercent / 100) * circumference;
        progressRing.style.strokeDashoffset = offset;
      }

    }

    // Initialize tabs
    initializeProgressTabs();

    // Event listeners
    levelsClose.addEventListener('click', () => {
      levelsPopup.classList.remove('show');
    });

    levelsPopup.addEventListener('click', (e) => {
      if (e.target === levelsPopup) {
        levelsPopup.classList.remove('show');
      }
    });

  }

  // Initialize progress bar system
  function initializeProgressBar() {

    initializeLevelsPopup();



    // Add level badge click handler
    const levelBadge = document.getElementById('user-level-badge');
    if (levelBadge) {
      levelBadge.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent dropdown from opening
        // Re-initialize popup to ensure fresh data
        initializeLevelsPopup();
        const levelsPopup = document.getElementById('levels-popup');
        if (levelsPopup) {
          levelsPopup.classList.add('show');
        }
      });
    }



    // Update progress when cards change
    const originalLoadSavedUserCards = loadSavedUserCards;
    const originalLoadCompletedUserCards = loadCompletedUserCards;

    loadSavedUserCards = function() {
      originalLoadSavedUserCards.call(this);
    };

    loadCompletedUserCards = function() {
      originalLoadCompletedUserCards.call(this);
    };
  }
  // PROGRESS BAR COMPONENT JS - END

  // Initialize event listeners when DOM is ready
  function initializeEventListeners() {
    // Initialize the UI
    updateCounterUI();

    // Initialize progress bar system
    initializeProgressBar();

    // Restore active state for filter buttons
//      filterButtons.forEach(btn => {
//        btn.classList.remove('active');
//        if (btn.getAttribute('data-filter') === currentTypeFilter) {
//          btn.classList.add('active');
//        }
//      });


      filterButtonsDropdown.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === currentTypeFilter) {
          btn.classList.add('active');
        }
      });
      filterButtonsGroup.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === currentTypeFilter) {
          btn.classList.add('active');
        }
      });

    // Load all card types
    loadSavedUserCards();
    loadCompletedUserCards();
    loadCommunityUserCards();

    renderCardList(currentTypeFilter, currentCategoryFilter);

    // Confirmation popup handlers
    const cancelBtn = document.getElementById('confirmation-cancel');
    const confirmBtn = document.getElementById('confirmation-confirm');

    if (cancelBtn) {
      cancelBtn.addEventListener('click', hideConfirmationPopup);
    } else {
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const popup = document.getElementById('confirmation-popup');
        const cardId = popup.dataset.cardId;
        const action = popup.dataset.action;


        if (cardId && action) {

          if (action === 'make-public') {
            makeCardPublic(cardId);
            hideConfirmationPopup();
            // Update UI without reloading page
            renderCardList(currentTypeFilter, currentCategoryFilter);
          } else if (action === 'make-private') {
            makeCardPrivate(cardId);
            hideConfirmationPopup();
            // Update UI without reloading page
            renderCardList(currentTypeFilter, currentCategoryFilter);
          }
        } else {
        }
      });
    }

    // Close confirmation popup when clicking outside
    const confirmationPopup = document.getElementById('confirmation-popup');
    if (confirmationPopup) {
      confirmationPopup.addEventListener('click', (e) => {
        if (e.target === confirmationPopup) {
          hideConfirmationPopup();
        }
      });
    }

    // Referral popup handlers
    const copyBtn = document.getElementById('copy-referral-btn');
    const referralCloseBtn = document.getElementById('referral-close');
    const referralPopup = document.getElementById('referral-popup');

    if (copyBtn) {
      copyBtn.addEventListener('click', copyReferralLink);
    }
    if (referralCloseBtn) {
      referralCloseBtn.addEventListener('click', hideReferralPopup);
    }
    if (referralPopup) {
      referralPopup.addEventListener('click', (e) => {
        if (e.target === referralPopup) {
          hideReferralPopup();
        }
      });
    }

    // Community empty state popup handlers
    const copyCommunityBtn = document.getElementById('copy-community-referral-btn');
    const communityCloseBtn = document.getElementById('community-popup-close');
    const communityPopup = document.getElementById('community-empty-popup');

    if (copyCommunityBtn) {
      copyCommunityBtn.addEventListener('click', copyCommunityReferralLink);
    }
    if (communityCloseBtn) {
      communityCloseBtn.addEventListener('click', hideCommunityEmptyPopup);
    }
    if (communityPopup) {
      communityPopup.addEventListener('click', (e) => {
        if (e.target === communityPopup) {
          hideCommunityEmptyPopup();
        }
      });
    }
  }

  // Initialize event listeners when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEventListeners);
  } else {
    initializeEventListeners();
  }

  btn.addEventListener('click', () => {
    if (attemptsLeft <= 0) return;
    btn.classList.add('loading');
    startLoadingAnimation();
    const context = window.getUserContext ? window.getUserContext() : {};
    let qs = '?';
    for (const key in context) {
      if (context.hasOwnProperty(key)) qs += encodeURIComponent(key) + '=' + encodeURIComponent(context[key]) + '&';
    }
    fetch(API_SUGGEST + qs, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'one-thing-session-id': generateUUID() }
    })
      .then(res => res.json())
      .then(data => {
        btn.classList.remove('loading');
        stopLoadingAnimation();


        currentSuggestion = {
          id: data.id || data.card_id || data.cardId || data.card?.id || data.item?.id || data.thing?.id || data.name || 'generated-' + Date.now(),
          title: data.title || data.name || 'No Tip This Time',
          description: data.description || 'Sometimes even the best advice needs a rest. Come back later.',
          category: data.category || data.card?.category || data.item?.category || data.thing?.category || 'places'
        };


        showPopup(currentSuggestion);
      })
      .catch(err => {
        btn.classList.remove('loading');
        stopLoadingAnimation();
      });
  });

  btnSave.addEventListener('click', () => {
    if (!currentSuggestion) return;
    const userId = ensureUserId();

    if (userId && currentSuggestion.id) {
      fetch(API_SAVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ one_thing_users_id: userId, one_thing_cards_id: currentSuggestion.id, expired_at: Date.now() + 1000 * 60 * 60 * 24 * 30 })
      })
      .then(response => {
        return response.json();
      })
      .then(data => {
          loadSavedUserCards();
          // Show success tooltip
          showSavedSuccessTooltip();
      })
    }

    // Add expiry timestamp with default image
//      savedCards.unshift({
//        ...currentSuggestion,
//        imageSrc: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif',
//        expiresAt: Date.now() + EXPIRY_MS
//      });

//      loadSavedUserCards();

    decrementAttempts();

    // Switch to Saved tab and update UI
//      filterButtons.forEach(b => b.classList.remove('active'));
//      const savedButton = document.querySelector('button[data-filter="saved"]');
//      if (savedButton) {
//        savedButton.classList.add('active');
//      }

    filterButtons.forEach(b => b.classList.remove('active'));
    const savedButton = document.querySelector('button[data-filter="saved"]');
    if (savedButton) {
      savedButton.classList.add('active');
    }

    renderCardList('saved', currentCategoryFilter);
    hidePopup();
  });

  btnSkip.addEventListener('click', () => {
    decrementAttempts();


    // Just hide the popup without switching tabs
    hidePopup();
  });

//    filterButtons.forEach(btn => {
//      btn.addEventListener('click', () => {
//        filterButtons.forEach(b => b.classList.remove('active'));
//
//
//        btn.classList.add('active');
//        currentTypeFilter = btn.getAttribute('data-filter');
//
//
//        localStorage.setItem('currentTypeFilter', currentTypeFilter);
//        renderCardList(currentTypeFilter, currentCategoryFilter);
//      });
//    });


  filterButtonsGroup.forEach(btn => {
    btn.addEventListener('click', () => {

      // Remove active class from all filter buttons
      filterButtons.forEach(b => b.classList.remove('active'));

      btn.classList.add('active');
      currentTypeFilter = btn.getAttribute('data-filter');

      localStorage.setItem('currentTypeFilter', currentTypeFilter);
      renderCardList(currentTypeFilter, currentCategoryFilter);
    });
  });

  filterButtonsDropdown.forEach(btn => {
    btn.addEventListener('click', () => {

      // Remove active class from all filter buttons
      filterButtons.forEach(b => b.classList.remove('active'));

      btn.classList.add('active');
      currentTypeFilter = btn.getAttribute('data-filter');


      localStorage.setItem('currentTypeFilter', currentTypeFilter);
      renderCardList(currentTypeFilter, currentCategoryFilter);
    });
  });

  // Remove ability to close popup by clicking outside or escape key
  // User must choose either Save or Skip to proceed

  function showPopup(card) {
    // Set category and icon based on card data
    const category = card.category || 'places'; // Default to places if not specified
    const categoryText = getCategoryText(category);
    const categoryIcon = getCategoryIcon(category);


    // Update popup content
    const categoryPill = document.getElementById('popup-category');
    const categoryTextElement = document.getElementById('popup-category-text');
    const categoryImage = document.getElementById('popup-category-image');

    categoryTextElement.textContent = categoryText;
    categoryImage.src = categoryIcon;
    popupTitle.textContent = card.title;
    popupDesc.textContent = card.description;

    // Update pill classes based on category
    const categoryClass = category.toLowerCase().replace(/\s+/g, '-');
    categoryPill.className = 'popup-category-pill ' + categoryClass;

    // Ensure popup is positioned correctly
    const popupElement = document.getElementById('one-thing-popup');
    popupElement.style.position = 'fixed';
    popupElement.style.top = '0';
    popupElement.style.left = '0';
    popupElement.style.width = '100vw';
    popupElement.style.height = '100vh';
    popupElement.style.zIndex = '999999';

    // Show popup with animation
    popup.classList.add('show');
  }

  function hidePopup() {
    popup.classList.remove('show');
    currentSuggestion = null;
  }

  function getCategoryText(category) {
    const categories = {
      'places': 'Places',
      'daily': 'Daily Things',
      'local': 'Local Context',
      'DAILY THINGS': 'Daily Things',
      'PLACES': 'Places',
      'LOCAL CONTEXT': 'Local Context',
      'DAILY': 'Daily Things',
      'LOCAL': 'Local Context',
      'DAILY-THINGS': 'Daily Things',
      'LOCAL-CONTEXT': 'Local Context'
    };
    return categories[category] || category || 'Places';
  }

  function getCategoryIcon(category) {
    const icons = {
      'places': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68baa92fd867e721bb77eeda_places-wc.avif',
      'daily': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68baa92a8316dd46343eceb7_daily-things-wc.avif',
      'local': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68baa92c7d59117cf84b0aac_local-context-wc.avif',
      'DAILY THINGS': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68baa92a8316dd46343eceb7_daily-things-wc.avif',
      'PLACES': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68baa92fd867e721bb77eeda_places-wc.avif',
      'LOCAL CONTEXT': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68baa92c7d59117cf84b0aac_local-context-wc.avif'
    };
    return icons[category] || icons['places'];
  }

  function decrementAttempts() {
    attemptsLeft--;
    localStorage.setItem('attemptsLeftAccount', attemptsLeft);
    localStorage.setItem('resetTimeAccount', resetTime);
    updateCounterUI();
  }
  // Loading phrases for dynamic text
  const loadingPhrases = [
    "Gathering one thing...",
    "Asking locals for secrets...",
    "Digging for hidden gems...",
    "Searching cozy nooks...",
    "Extracting calm in chaos...",
    "Sneaking past tourist traps..."
  ];

  let currentLoadingIndex = 0;
  let loadingInterval = null;

  function updateCounterUI() {
    const oneThingBtn = document.getElementById('one-thing-btn');

    if (attemptsLeft > 0) {
      attemptsCounter.textContent = `${attemptsLeft} / ${MAX_ATTEMPTS} left today`;
      attemptsCounter.classList.remove('no-attempts');
      oneThingBtn.classList.remove('inactive');
    } else {
      attemptsCounter.textContent = `Next in: ${getTimeLeft()}`;
      attemptsCounter.classList.add('no-attempts');
      oneThingBtn.classList.add('inactive');
    }
  }

  function startLoadingAnimation() {
    currentLoadingIndex = 0;
    attemptsCounter.textContent = loadingPhrases[0];
    attemptsCounter.classList.remove('no-attempts');

    loadingInterval = setInterval(() => {
      currentLoadingIndex = (currentLoadingIndex + 1) % loadingPhrases.length;
      attemptsCounter.textContent = loadingPhrases[currentLoadingIndex];
    }, 2000);
  }

  function stopLoadingAnimation() {
    if (loadingInterval) {
      clearInterval(loadingInterval);
      loadingInterval = null;
    }
    updateCounterUI();
  }
  function getMidnightTimestamp() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime();
  }
  function getTimeLeft() {
    const dist = resetTime - Date.now();
    if (dist <= 0) {
      resetTime = getMidnightTimestamp();
      attemptsLeft = MAX_ATTEMPTS;
      localStorage.setItem('attemptsLeftAccount', attemptsLeft);
      localStorage.setItem('resetTimeAccount', resetTime);
      return '00h 00m';
    }
    const h = Math.floor(dist / (1000 * 60 * 60));
    const m = Math.floor((dist % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m`;
  }
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function showSuccessTooltip() {
    const tooltip = document.getElementById('success-tooltip');
    if (tooltip) {
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    } else {
    }
  }

  function showPublicSuccessTooltip() {
    const tooltip = document.getElementById('public-success-tooltip');
    if (tooltip) {
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    } else {
    }
  }

  function showPrivateSuccessTooltip() {
    const tooltip = document.getElementById('private-success-tooltip');
    if (tooltip) {
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    } else {
    }
  }

  function showSavedSuccessTooltip() {
    const tooltip = document.getElementById('saved-success-tooltip');
    if (tooltip) {
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    } else {
    }
  }

  function showCopyErrorTooltip() {
    const tooltip = document.getElementById('copy-error-tooltip');
    if (tooltip) {
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    } else {
    }
  }

  function showHeicErrorTooltip() {
    const tooltip = document.getElementById('heic-error-tooltip');
    if (tooltip) {
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    } else {
    }
  }

  function showLocationErrorTooltip(message) {
    const tooltip = document.getElementById('location-error-tooltip');
    if (tooltip) {
      const tooltipText = tooltip.querySelector('span');
      if (tooltipText) {
        tooltipText.textContent = message;
      }
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    } else {
    }
  }

  function showLocationSuccessTooltip() {
    const tooltip = document.getElementById('location-success-tooltip');
    if (tooltip) {
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    } else {
    }
  }

  function showContextSuccessTooltip() {
    const tooltip = document.getElementById('context-success-tooltip');
    if (tooltip) {
      tooltip.classList.add('show');
      setTimeout(() => {
        tooltip.classList.remove('show');
      }, 3000);
    }
  }

  function showConfirmationPopup(one_thing_user_card_id, action) {

    // Look for card in both savedCards and completedCards
    let card = savedCards.find(c => c.one_thing_user_card_id === one_thing_user_card_id);
    if (!card) {
      card = completedCards.find(c => c.one_thing_user_card_id === one_thing_user_card_id);
    }
    if (!card) {
      return;
    }

    const titleEl = document.getElementById('confirmation-title');
    const descriptionEl = document.getElementById('confirmation-description');
    const confirmBtn = document.getElementById('confirmation-confirm');


    if (action === 'make-public') {
      titleEl.textContent = 'Make Thing Public?';
      descriptionEl.textContent = 'This will make your completed thing visible to the community. Other users will be able to see and get inspired by your experience.';
      confirmBtn.textContent = 'Make Thing Public';
    } else if (action === 'make-private') {
      titleEl.textContent = 'Make Thing Private?';
      descriptionEl.innerHTML = 'Are you sure you want to remove this from the community? <br><br><strong>Your experience could inspire others!</strong> 🌟<br><br>By keeping it public, you\'re helping create a vibrant community of people sharing their adventures and discoveries.';
      confirmBtn.textContent = 'Make Private';
    }

    // Store the card ID and action for confirmation
    const popup = document.getElementById('confirmation-popup');
    if (popup) {
      popup.dataset.cardId = one_thing_user_card_id;
      popup.dataset.action = action;
      popup.classList.add('show');
    } else {
    }
  }

  function hideConfirmationPopup() {
    document.getElementById('confirmation-popup').classList.remove('show');
    delete document.getElementById('confirmation-popup').dataset.cardId;
    delete document.getElementById('confirmation-popup').dataset.action;
  }

  // Global functions for empty state buttons
  function scrollToGetOneThing() {
    // Scroll to top of page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  function showReferralPopup() {
    const userId = ensureUserId();
    const referralCode = userId ? userId.substring(0, 8) : 'YOURCODE';

    document.getElementById('referral-code').textContent = referralCode;
    document.getElementById('referral-popup').classList.add('show');
  }

  function hideReferralPopup() {
    document.getElementById('referral-popup').classList.remove('show');
  }

  function copyReferralLink() {
    const userId = ensureUserId();
    const referralCode = userId ? userId.substring(0, 8) : 'YOURCODE';
    const fullLink = `https://globio.io/ref/${referralCode}`;

    navigator.clipboard.writeText(fullLink).then(() => {
      const copyBtn = document.getElementById('copy-referral-btn');
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      showCopyErrorTooltip();
    });
  }

  function showCommunityEmptyPopup() {
    const userId = ensureUserId();
    const referralCode = userId ? userId.substring(0, 8) : 'YOURCODE';

    document.getElementById('community-referral-code').textContent = referralCode;
    document.getElementById('community-empty-popup').classList.add('show');
  }

  function hideCommunityEmptyPopup() {
    document.getElementById('community-empty-popup').classList.remove('show');
  }

  function copyCommunityReferralLink() {
    const userId = ensureUserId();
    const referralCode = userId ? userId.substring(0, 8) : 'YOURCODE';
    const fullLink = `https://globio.io/ref/${referralCode}`;

    navigator.clipboard.writeText(fullLink).then(() => {
      const copyBtn = document.getElementById('copy-community-referral-btn');
      copyBtn.textContent = 'Copied!';
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.textContent = 'Copy';
        copyBtn.classList.remove('copied');
      }, 2000);
    }).catch(err => {
      showCopyErrorTooltip();
    });
  }

  function makeCardPublic(cardId) {
    cardId = parseInt(cardId);
    // Look for card in both savedCards and completedCards
    let card = savedCards.find(c => c.one_thing_user_card_id == cardId);
    if (!card) {
      card = completedCards.find(c => c.one_thing_user_card_id == cardId);
    }
    if (!card) {
      return;
    }
    
    // Update card status locally
    card.published = true;
    card.published_at = Date.now();
    
    // Add to publicCards array at the beginning
    const publicCard = {
      ...card,
      type: 'community'
    };
    publicCards.unshift(publicCard);
    
    const userId = ensureUserId();
    const requestBody = {
      one_thing_user_card_id: cardId,
      published: true,
      completed: true,
      published_at: Date.now()
    };
    makeApiCall(requestBody, card);
  }

   function makeCardCompleted(one_thing_user_card_id) {
      const userId = ensureUserId();


      // Find the card in savedCards
      const cardIndex = savedCards.findIndex(c => c.one_thing_user_card_id == one_thing_user_card_id);
      if (cardIndex === -1) {
          return;
      }

      const card = savedCards[cardIndex];

      // Update the card type to completed
      card.type = 'completed';
      card.completed = true;
      card.completed_at = Date.now();

      // Remove from savedCards array
      savedCards.splice(cardIndex, 1);

      // Add to completedCards array at the beginning
      completedCards.unshift(card);


      const requestBody = {
          one_thing_user_card_id: one_thing_user_card_id,
          completed: true,
          published: false,
          completed_at: Date.now()
      };

      makeApiCall(requestBody, card);

      // Set currentTypeFilter to completed for next page load
      localStorage.setItem('currentTypeFilter', 'completed');
  }

  function makeApiCall(requestBody, card) {
    fetch(API_SET_CARD_PUBLISH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to update card: ${response.status} ${response.statusText}`);
        }
        return response.json();
      })
      .then(data => {

        // If this was a completion request, the card is already moved in makeCardCompleted
        if (requestBody.completed) {
        } else if (requestBody.published !== undefined) {
          // This was a publish/unpublish request

          // Update the card status in the appropriate array
          let cardToUpdate = savedCards.find(c => c.one_thing_user_card_id == requestBody.one_thing_user_card_id);
          if (!cardToUpdate) {
            cardToUpdate = completedCards.find(c => c.one_thing_user_card_id == requestBody.one_thing_user_card_id);
          }

          if (cardToUpdate) {
            cardToUpdate.published = requestBody.published;
          }

          // Update the toggle label and state without re-rendering the entire list
          const toggle = document.querySelector(`#toggle-${cardToUpdate.id}`);
          if (toggle) {
            toggle.disabled = false;
            toggle.checked = requestBody.published;

            // Update the toggle label
            const toggleContainer = toggle.closest('.toggle-container');
            if (toggleContainer) {
              const toggleLabel = toggleContainer.querySelector('.toggle-label');
              if (toggleLabel) {
                toggleLabel.textContent = requestBody.published ? 'Public' : 'Make Public';
              }
            }

          } else {
          }

          // Update publicCards if card was published/unpublished
          if (requestBody.published) {
            // Add card to publicCards if it's not already there
            const existingPublicCard = publicCards.find(pc => pc.one_thing_user_card_id == requestBody.one_thing_user_card_id);
            if (!existingPublicCard && cardToUpdate) {
              const publicCard = {
                ...cardToUpdate,
                type: 'community',
                published_at: Date.now()
              };
              publicCards.unshift(publicCard); // Add to beginning of array
            }
          } else {
            // Remove card from publicCards if it was unpublished
            const publicCardIndex = publicCards.findIndex(pc => pc.one_thing_user_card_id == requestBody.one_thing_user_card_id);
            if (publicCardIndex !== -1) {
              publicCards.splice(publicCardIndex, 1);
            }
          }

          // Show appropriate success tooltip
          if (requestBody.published) {
            showPublicSuccessTooltip();
          } else {
            showPrivateSuccessTooltip();
          }

          // Update the current view to reflect changes without reloading
          renderCardList(currentTypeFilter, currentCategoryFilter);
        }
      })
      .catch(error => {

        // If this was a publish request, re-enable toggle on error
        if (requestBody.published !== undefined) {
          // Find the card again for error handling
          let cardToUpdate = savedCards.find(c => c.one_thing_user_card_id == requestBody.one_thing_user_card_id);
          if (!cardToUpdate) {
            cardToUpdate = completedCards.find(c => c.one_thing_user_card_id == requestBody.one_thing_user_card_id);
          }

          if (cardToUpdate) {
            const toggle = document.querySelector(`#toggle-${cardToUpdate.id}`);
          if (toggle) {
            toggle.disabled = false;
            toggle.checked = !requestBody.published; // Reset to previous state

            // Reset the toggle label to previous state
            const toggleContainer = toggle.closest('.toggle-container');
            if (toggleContainer) {
              const toggleLabel = toggleContainer.querySelector('.toggle-label');
              if (toggleLabel) {
                toggleLabel.textContent = !requestBody.published ? 'Public' : 'Make Public';
              }
            }

          }
          }
        }
      });
  }

  function makeCardPrivate(cardId) {
      cardId = parseInt(cardId);
      // Look for card in both savedCards and completedCards
      let card = savedCards.find(c => c.one_thing_user_card_id == cardId);
      if (!card) {
        card = completedCards.find(c => c.one_thing_user_card_id == cardId);
      }
      if (!card) {
        return;
      }
      
      // Update card status locally
      card.published = false;
      card.published_at = null;
      
      // Remove from publicCards array
      const publicCardIndex = publicCards.findIndex(pc => pc.one_thing_user_card_id == cardId);
      if (publicCardIndex !== -1) {
        publicCards.splice(publicCardIndex, 1);
      }
      
      const userId = ensureUserId();
      const requestBody = {
        one_thing_user_card_id: cardId,
        published: false,
        completed: true,
        published_at: null
      };
      makeApiCall(requestBody, card);
  }

  function uploadFile(file) {
      const formData = new FormData();
      formData.append("workspace_id", "1-0"); // ← сюда свой ID воркспейса
      formData.append("type", "image"); // можно "attachment", "video", "audio"
      formData.append("content", file);

      return fetch(API_SET_CARD_UPLOAD_IMAGE, {
          method: 'POST',
          headers: {
          },
          body: formData
      })
     .then(response => {
       return response.json();
     })
     .then(data => {
       const imagePath = data.path;
       return imagePath;
     })
      .catch(error => {
      });
};

  function renderCardList(filter = 'all', categoryFilter = 'all') {
    // Add fade out effect
    cardList.style.opacity = '0.7';
    cardList.style.transform = 'scale(0.98)';
    cardList.style.transition = 'all 0.2s ease';

    setTimeout(() => {
      cardList.innerHTML = '';
      // Remove expired cards
      const now = Date.now();
      savedCards = savedCards.filter(card => card.expiresAt > now);
      completedCards = completedCards.filter(card => card.expiresAt > now);

      let toShow = [];




      // Filter by type (saved/completed/community)
      if (filter === 'saved') {
        toShow = toShow.concat(savedCards);
      } else if (filter === 'completed') {
        toShow = toShow.concat(completedCards);
      } else if (filter === 'community') {
        toShow = toShow.concat(publicCards || []);
      } else if (filter === 'all') {
        // For 'all' filter, combine all card types
        toShow = toShow.concat(savedCards);
        toShow = toShow.concat(completedCards);
        toShow = toShow.concat(publicCards || []);
      }






      // Filter by category
//        if (categoryFilter !== 'all') {
//          toShow = toShow.filter(card => card.category === categoryFilter);
//        }

      if (categoryFilter === 'daily') {
          toShow = toShow.filter(card => card.category == "DAILY THINGS");
      }

      if (categoryFilter === 'places') {
          toShow = toShow.filter(card => card.category == "PLACES");
      }

      if (categoryFilter === 'local') {
          toShow = toShow.filter(card => card.category == "LOCAL CONTEXT");
      }

      if (toShow.length === 0) {
        let emptyStateHtml = '';

        if (filter === 'saved') {
          emptyStateHtml = `
        <div class="empty-state">
          <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68949b2379142ee1bc95f3f2_6cd31bde078d550f5278843c00331b47_no-things-yet.svg" alt="">
          <h3>No saved things yet</h3>
          <p>This space will become a reflection of your progress, unique discoveries, and the helpful advice you've gathered along the way.</p>
          <button class="empty-state-btn" onclick="scrollToGetOneThing()">Get One Thing</button>
        </div>`;
        } else if (filter === 'completed') {
          emptyStateHtml = `
        <div class="empty-state">
          <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68949b2379142ee1bc95f3f2_6cd31bde078d550f5278843c00331b47_no-things-yet.svg" alt="">
          <h3>No completed things yet</h3>
          <p>This space will become a reflection of your progress, unique discoveries, and the helpful advice you've gathered along the way.</p>
          <button class="empty-state-btn" onclick="scrollToGetOneThing()">Get One Thing</button>
        </div>`;
        } else if (filter === 'community') {
          emptyStateHtml = `
        <div class="empty-state">
          <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6894a725c6e8a617ce6d1fe2_no-things-community.svg" alt="">
          <h3>No community contributions yet</h3>
          <p>Here you'll see all the things completed by the Globio community in your area—helpful tips and experiences, tailored to your current location.</p>
          <button class="empty-state-btn" onclick="showCommunityEmptyPopup()">Invite a Friend</button>
        </div>`;
        } else {
          emptyStateHtml = `
        <div class="empty-state">
          <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68949b2379142ee1bc95f3f2_6cd31bde078d550f5278843c00331b47_no-things-yet.svg" alt="">
          <h3>No saved things yet</h3>
          <p>This space will become a reflection of your progress, unique discoveries, and the helpful advice you've gathered along the way.</p>
          <button class="empty-state-btn" onclick="scrollToGetOneThing()">Get One Thing</button>
        </div>`;
        }

        cardList.innerHTML = emptyStateHtml;
        return;
      }
      toShow.forEach((card, idx) => {
        const cardEl = document.createElement('div');
        cardEl.className = 'one-thing-card';
        let expiryHtml = '';
        if (card.type === 'saved') {
          const daysLeft = Math.ceil((card.expiresAt - now) / (1000 * 60 * 60 * 24));
          let urgencyClass = '';
          if (daysLeft === 1) {
            urgencyClass = ' critical';
          } else if (daysLeft <= 3) {
            urgencyClass = ' warning';
          }
          expiryHtml = `<div class="card-expiry${urgencyClass}">${daysLeft} day${daysLeft === 1 ? '' : 's'} left</div>`;
        }
        let toggleHtml = '';

        if (card.type === 'completed') {
          toggleHtml = `
        <div class="toggle-container">
          <span class="toggle-label">${card.published ? 'Public' : 'Make Public'}</span>
          <div class="toggle-switch">
            <input type="checkbox" id="toggle-${card.id}" ${card.published ? 'checked' : ''}>
            <label class="toggle-slider" for="toggle-${card.id}"></label>
          </div>
        </div>
      `;
        }

        // Get category text
        const categoryText = getCategoryText(card.category);

        // Check if the image is the default add-photo icon
        const isDefaultImage = card.imageSrc.includes('add-photo');

        // Create expiry HTML or complete button based on image state
        let actionHtml = '';

        if (card.type === 'saved') {
          if (isDefaultImage) {
            // Show expiry counter for cards without photos
            const daysLeft = Math.ceil((card.expiresAt - Date.now()) / (1000 * 60 * 60 * 24));
            let urgencyClass = '';
            if (daysLeft === 1) {
              urgencyClass = ' critical';
            } else if (daysLeft <= 3) {
              urgencyClass = ' warning';
            }
            actionHtml = `<div class="card-expiry${urgencyClass}">${daysLeft} day${daysLeft === 1 ? '' : 's'} left</div>`;
          } else {
            // Show complete button for cards with photos
            actionHtml = `<button class="complete-thing-btn" data-card-id="${card.one_thing_user_card_id}">Complete Thing</button>`;
          }
        } else if (card.type === 'completed') {
          // For completed cards, no action button needed - just show the image
          actionHtml = '';
        } else {
          actionHtml = expiryHtml;
        }

        // Add author name and avatar for community cards
        let authorHtml = '';
        if (card.type === 'community') {
          const authorName = card.author_name || card.user_name || 'User';
          const authorAvatar = card.author_avatar;

          if (authorAvatar) {
            authorHtml = `
              <div class="card-author">
                <img src="${authorAvatar}" alt="${authorName}" class="author-avatar" width="20" height="20"
                     onerror="this.style.display='none'; this.nextElementSibling.style.marginLeft='0';">
                <span>by ${authorName}</span>
              </div>`;
          } else {
            authorHtml = `<div class="card-author">by ${authorName}</div>`;
          }
        }

        // Create different HTML for saved vs completed cards
        let imageHtml = '';
        if (card.type === 'saved') {
          // For saved cards, show interactive image upload
          imageHtml = `
      <div class="card-image-placeholder">
        <img src="${card.imageSrc}" alt="Card image" class="${isDefaultImage ? 'add-photo-icon' : 'uploaded-image'}" style="display: ${isDefaultImage ? 'none' : 'block'}" data-card-id="${card.id}"
             onerror="this.src='https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif'; this.className='add-photo-icon'; this.style.display='block'; this.nextElementSibling.style.display='none';">
        <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif"
             alt="Add photo"
             class="add-photo-icon"
             style="display: ${isDefaultImage ? 'block' : 'none'}"
             data-card-id="${card.id}">
        <input type="file" accept="image/*,.heic,.heif" data-card-id="${card.id}">
        <div class="image-upload-loader" data-card-id="${card.id}">
          <div class="spinner"></div>
          <div class="loading-text">Uploading image...</div>
        </div>
      </div>`;
        } else if (card.type === 'completed') {
          // For completed cards, show static image only
          imageHtml = `
      <div class="card-image-placeholder">
        <img src="${card.imageSrc}" alt="Card image" class="uploaded-image" style="display: block;" data-card-id="${card.id}"
             onerror="this.src='https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif'">
      </div>`;
        } else {
          // For community cards, show static image
          imageHtml = `
      <div class="card-image-placeholder">
        <img src="${card.imageSrc}" alt="Card image" class="uploaded-image" style="display: block;" data-card-id="${card.id}"
             onerror="this.src='https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif'">
      </div>`;
        }

        cardEl.innerHTML = `
      <div class="card-category-tag ${card.category || 'PLACES'}">${categoryText}</div>
      ${imageHtml}
      <h4>${card.title}</h4>
      <p>${card.description}</p>
      ${actionHtml}
      ${toggleHtml}
      ${authorHtml}
    `;
        // Add image upload functionality only for saved cards
        if (card.type === 'saved') {
          const placeholder = cardEl.querySelector('.card-image-placeholder');
          const img = cardEl.querySelector(`img[data-card-id="${card.id}"][alt="Card image"]`);
          const addPhotoIcon = cardEl.querySelector(`img[data-card-id="${card.id}"].add-photo-icon`);
          const input = cardEl.querySelector(`input[data-card-id="${card.id}"]`);

          // Set initial classes based on image state
          if (isDefaultImage) {
            img.className = 'add-photo-icon';
          } else {
            img.className = 'uploaded-image';
          }

//              img: !!img,
//              addPhotoIcon: !!addPhotoIcon,
//              input: !!input
//            });

          input.addEventListener('change', e => {
            const file = e.target.files[0];
            if (file) {
              var userCardId = card.one_thing_user_card_id;

               uploadFile(file)
                 .then(function(imagePath) {
                  uploadFileName = imagePath;
                   const requestBody = {
                     one_thing_user_card_id: userCardId,
                     image: imagePath
                   };

                   return makeApiCall(requestBody, card);
                 })
                 .then(function(response) {
                 })
                 .catch(function(error) {
                 });







              // Show loader
              const loader = cardEl.querySelector(`.image-upload-loader[data-card-id="${card.id}"]`);
              const startTime = Date.now();
              const minLoadTime = 1000; // Minimum 1 second

              if (loader) {
                loader.classList.add('show');
              }

              // Function to process image (either HEIC or regular image)
              const processImage = (imageBlob) => {
                const reader = new FileReader();
                reader.onload = ev => {

                  // Calculate how long the loader should be shown
                  const elapsedTime = Date.now() - startTime;
                  const remainingTime = Math.max(0, minLoadTime - elapsedTime);

                  setTimeout(() => {
                    // Hide loader
                    if (loader) {
                      loader.classList.remove('show');
                    }

                    // Update image
                    img.src = ev.target.result;
                    img.className = 'uploaded-image';
                    img.style.display = 'block';
                    addPhotoIcon.style.display = 'none';

                    if (card.type === 'saved') {
                      // Update the card's image in saved cards
                      const savedIndex = savedCards.findIndex(c => c.id === card.id);
                      if (savedIndex !== -1) {
                        savedCards[savedIndex].imageSrc = ev.target.result;
//                          try {
//                            localStorage.setItem('savedCards', JSON.stringify(savedCards));
//                          } catch (e) {
//                            // Clear old data and try again
//                            localStorage.clear();
//                            localStorage.setItem('savedCards', JSON.stringify(savedCards));
//                          }

                        // Re-render the list to show the complete button
                        renderCardList(currentTypeFilter, currentCategoryFilter);
                      } else {
                      }
                    }
                  }, remainingTime);
                };

                reader.onerror = () => {
                  if (loader) {
                    loader.classList.remove('show');
                  }
                };

                reader.readAsDataURL(imageBlob);
              };

              // Check if file is HEIC/HEIF format
              const isHeic = file.name.toLowerCase().endsWith('.heic') ||
                file.name.toLowerCase().endsWith('.heif') ||
                file.type === 'image/heic' ||
                file.type === 'image/heif';

              if (isHeic && typeof heic2any !== 'undefined') {

                // Convert HEIC to JPEG
                heic2any({
                  blob: file,
                  toType: 'image/jpeg',
                  quality: 0.8
                }).then(convertedBlob => {
                  processImage(convertedBlob);
                }).catch(error => {
                  if (loader) {
                    loader.classList.remove('show');
                  }
                  showHeicErrorTooltip();
                });
              } else {
                // Process regular image file
                processImage(file);
              }
            }
          });
        }

        // Add complete button functionality
        const completeBtnPopup = cardEl.querySelector('.complete-thing-btn');
        if (completeBtnPopup) {
          completeBtnPopup.addEventListener('click', () => {
            if (card.type === 'saved') {

              makeCardCompleted(card.one_thing_user_card_id);

              // Show success tooltip
              showSuccessTooltip();

              // Update UI without reloading page
              // Switch to Completed tab
              filterButtons.forEach(b => b.classList.remove('active'));
              const completedButton = document.querySelector('button[data-filter="completed"]');
              if (completedButton) {
                completedButton.classList.add('active');
              }
              
              // Update current filter and render the list
              currentTypeFilter = 'completed';
              localStorage.setItem('currentTypeFilter', 'completed');
              renderCardList('completed', currentCategoryFilter);
              
              // Update progress bar to reflect new completed card
            }
          });
        }

        // Add toggle switch functionality for completed cards
        if (card.type === 'completed') {
          const toggle = cardEl.querySelector('input[type="checkbox"]');
          if (toggle) {
            toggle.addEventListener('change', (e) => {

              // Disable toggle during API call
              toggle.disabled = true;

              if (e.target.checked && !card.published) {
                // Making public
                showConfirmationPopup(card.one_thing_user_card_id, 'make-public');
              } else if (!e.target.checked && card.published) {
                // Making private
                showConfirmationPopup(card.one_thing_user_card_id, 'make-private');
              } else {
              }

              // Reset the toggle to current state until confirmed with smooth animation
              setTimeout(() => {
                e.target.checked = card.published;
                toggle.disabled = false;
              }, 150);
            });
          }
        }

        cardList.appendChild(cardEl);
      });

      // Add fade in effect
      setTimeout(() => {
        cardList.style.opacity = '1';
        cardList.style.transform = 'scale(1)';
      }, 50);
    });
  }

  // Update expiry count every hour (refreshes days left)
//    setInterval(() => {
//      renderCardList(currentTypeFilter, currentCategoryFilter);
//    }, 60 * 60 * 1000);
  // Keep attempts counter updated every minute
//    setInterval(() => { if (attemptsLeft <= 0) updateCounterUI(); }, 60000);



//    function loadCards() {
//      if (!currentSuggestion) return;
//      const userId = ensureUserId();
//      if (userId && currentSuggestion.id) {
//        let user = fetch(API_USERS + '/' + userId, {
//          method: 'GET',
//          headers: { 'Content-Type': 'application/json' },
//      }
//    }



//    // Load public cards from API on initialization
//    function loadUserCards() {
//
//      const userId = ensureUserId();
//      if (!userId) {
//        return;
//      }
//
//      fetch(API_USERS + '/' + userId)
//        .then(response => {
//          return response.json();
//        })
//        .then(data => {
//          if (data) {
//            const usersCards = data.users_cards.map(item => item.card);
//
//
//
//
//            const formattedCards = usersCards.map(card => ({
//              id: card.name, // или card.id, если нужен числовой
//              title: card.name,
//              description: `Discover the ${card.name} in ${card.city}. A great spot for ${card.tags.split(",").join(", ")}.`,
//              category: card.tags.split(",")[0]?.toUpperCase() || "LOCAL CONTEXT",
//              imageSrc: "https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif", // заглушка
//              expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30 // через 30 дней
//            }));
//
//            savedCards = formattedCards;
//
////            localStorage.setItem('savedCards', JSON.stringify(formattedCards));
//            renderCardList('saved', currentCategoryFilter);
//          }
//        })
//        .catch(error => {
//        });
//    }



  function loadSavedUserCards() {
    const userId = ensureUserId();
    if (!userId) {
      return;
    }

    fetch(API_USERS + '/' + userId)
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data) {
       var usersCards = data.users_cards
             .filter(item => item.created_at !== null)
             .map(item => ({
               ...item.card,
               expired_at: item.expired_at,
               one_thing_user_card_id: item.id,
               completed: item.completed,
               published: item.published,
               image: item.image,
               created_at: item.created_at
             }))
             .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

          var formattedCards = usersCards
            .filter(card => !card.completed) // Only show non-completed cards in saved
            .map(card => ({
              id: card.id,
              title: card.title,
              description: card.description,
              category: card.tags.split(",")[0]?.toUpperCase() || "LOCAL CONTEXT",
              imageSrc: card.image ? "https://xu8w-at8q-hywg.n7d.xano.io" + card.image : "https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif",
              expiresAt: card.expired_at,
              one_thing_user_card_id: card.one_thing_user_card_id,
              completed: card.completed,
              published: card.published,
              type: "saved"
            }));
          savedCards = formattedCards;
          renderCardList('saved', currentCategoryFilter);
        }
      })
      .catch(error => {
      });
  }


   function loadCompletedUserCards() {
        const userId = ensureUserId();
        if (!userId) {
          return;
        }

        fetch(API_USERS + '/' + userId)
          .then(response => {
            return response.json();
          })
          .then(data => {
            if (data) {
              var usersCards = data.users_cards
                .filter(item => item.completed_at !== null)
                .map(item => ({
                  ...item.card,
                  expired_at: item.expired_at,
                  one_thing_user_card_id: item.id,
                  completed: item.completed,
                  published: item.published,
                  imageSrc: item.image,
                  completed_at: item.completed_at
                }))
                .sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

              var formattedCards = usersCards
                .filter(card => card.completed) // Only show completed cards
                .map(card => ({
                  id: card.id,
                  title: card.title,
                  description: card.description,
                  category: card.tags.split(",")[0]?.toUpperCase() || "LOCAL CONTEXT",
                  imageSrc: "https://xu8w-at8q-hywg.n7d.xano.io" + card.imageSrc,
                  expiresAt: card.expired_at,
                  one_thing_user_card_id: card.one_thing_user_card_id,
                  completed: card.completed,
                  published: card.published,
                  type: "completed"
                }));
              completedCards = formattedCards;
              renderCardList('completed', currentCategoryFilter);
            }
          })
          .catch(error => {
          });
  }

   function loadCommunityUserCards() {

        // Get all published cards from all users
        fetch('https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users_cards')
          .then(response => {
            return response.json();
          })
          .then(data => {
            if (data && Array.isArray(data)) {
              // Filter only published cards from all users
              var publishedCards = data
                .filter(item => item.published === true && item.completed === true)
                .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));


              // Get unique user IDs and card IDs to fetch details
              var userIds = [...new Set(publishedCards.map(card => card.one_thing_users_id))];
              var cardIds = [...new Set(publishedCards.map(card => card.one_thing_cards_id))];

              // Fetch only user details (skip card details since they don't exist)
              Promise.all([
                // Fetch all users
                ...userIds.map(userId =>
                  fetch(`https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users/${userId}`)
                    .then(response => response.json())
                    .then(userData => ({ userId, userData }))
                )
              ]).then(results => {
                // Process user data only
                var userDataMap = {};

                results.forEach(result => {
                  if (result.userId) {
                    userDataMap[result.userId] = result.userData;
                  }
                });


                // Format cards using only publishedCards data (since cardData doesn't exist)
                var formattedCards = publishedCards.map(card => {
                  var userData = userDataMap[card.one_thing_users_id];

                  // Debug logging

                  // Use fallback data since cardData doesn't exist
                  const cardName = `Community Card ${card.one_thing_cards_id}`;
                  const cardCity = 'your area';
                  const cardTags = 'exploration';
                  const cardCategory = 'PLACES';

                  return {
                    id: card.one_thing_cards_id,
                    title: card.title,
                    description: card.description,
                    category: cardCategory,
                    imageSrc: card.image ? "https://xu8w-at8q-hywg.n7d.xano.io" + card.image : "",
                    expiresAt: card.expired_at,
                    one_thing_user_card_id: card.id,
                    completed: card.completed,
                    published: card.published,
                    author_name: userData ? (userData.name || 'User') : `User ${card.one_thing_users_id}`,
                    author_avatar: userData && userData.picture ? (userData.picture.startsWith('http') ? userData.picture : `https://xu8w-at8q-hywg.n7d.xano.io${userData.picture}`) : null,
                    type: "community"
                  };
                });

                publicCards = formattedCards;
              }).catch(error => {
                // Fallback to basic cards if detailed loading fails
                var formattedCards = publishedCards.map(card => ({
                  id: card.one_thing_cards_id,
                  title: `Community Card ${card.id}`,
                  description: `A community shared card from user ${card.one_thing_users_id}`,
                  category: "PLACES",
                  imageSrc: card.image ? "https://xu8w-at8q-hywg.n7d.xano.io" + card.image : "",
                  expiresAt: card.expired_at,
                  one_thing_user_card_id: card.id,
                  completed: card.completed,
                  published: card.published,
                  author_name: `User ${card.one_thing_users_id}`,
                  author_avatar: null,
                  type: "community"
                }));
                publicCards = formattedCards;
              });
            }
          })
          .catch(error => {
          });
      }




  // Removed duplicate event listener - handled by filterButtonsGroup.forEach


  // Removed duplicate event listeners - handled by filterButtonsGroup.forEach






  // All Categories Dropdown Functionality
  function initializeDropdown() {
    const dropdownTrigger = document.getElementById('all-categories-dropdown');
    const dropdownMenu = document.getElementById('categories-dropdown-menu');
    const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');

    if (!dropdownTrigger || !dropdownMenu) return;

    // Set initial active state based on saved category filter
    dropdownItems.forEach(item => {
      if (item.getAttribute('data-category') === currentCategoryFilter) {
        item.classList.add('selected');
        dropdownTrigger.querySelector('span').textContent = item.querySelector('span').textContent;
      } else {
        item.classList.remove('selected');
      }
    });

    // Toggle dropdown
    dropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();

      dropdownTrigger.classList.toggle('active');
      dropdownMenu.classList.toggle('show');

      // Ensure dropdown trigger stays active
      if (!dropdownMenu.classList.contains('show')) {
        dropdownTrigger.classList.add('active');
      }
    });

    // Handle dropdown item selection
    dropdownItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = item.getAttribute('data-category');

        // Update dropdown trigger text
        dropdownTrigger.querySelector('span').textContent = item.querySelector('span').textContent;

        // Update active states
        dropdownItems.forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');

        // Close dropdown but keep trigger active
        dropdownTrigger.classList.remove('active');
        dropdownMenu.classList.remove('show');

        // Keep dropdown trigger button always active
        dropdownTrigger.classList.add('active');

        // Update category filter
        currentCategoryFilter = category;
        localStorage.setItem('currentCategoryFilter', category);

        // Trigger filter change using saved type filter
        renderCardList(currentTypeFilter, currentCategoryFilter);
      });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!dropdownTrigger.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownTrigger.classList.remove('active');
        dropdownMenu.classList.remove('show');

        // Keep dropdown trigger button always active
        dropdownTrigger.classList.add('active');
      }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        dropdownTrigger.classList.remove('active');
        dropdownMenu.classList.remove('show');

        // Keep dropdown trigger button always active
        dropdownTrigger.classList.add('active');
      }
    });
  }
})();
