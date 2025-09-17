 (function () {
  // Mapbox configuration
  const mapboxToken = "pk.eyJ1IjoibWF4aW1nbG9iaW8iLCJhIjoiY205ZTV1Z3Q0MTJuZjJrczduaWpmczFxOSJ9.uxg6_dvAoTHfmhAicl9pjA";

  // Calculate circle size for 50km radius at current zoom level
  function calculateCircleSize(zoom) {
    // At zoom level 5.5, 50km radius should be approximately 100px
    // Previous calculation was wrong - it was showing ~138km instead of 50km
    // Corrected size: 280px / 2.76 ≈ 101px for 50km at zoom 5.5
    const baseZoom = 5.5;
    const baseSize = 101; // pixels for 50km at zoom 5.5 (corrected)
    const scaleFactor = Math.pow(2, zoom - baseZoom);
    return Math.round(baseSize * scaleFactor);
  }

  // Update zone circle size based on map zoom
  function updateZoneCircleSize(zoom) {
    const circle = document.getElementById('user-zone-circle');
    if (circle) {
      const size = calculateCircleSize(zoom);
      circle.style.width = size + 'px';
      circle.style.height = size + 'px';
    }
  }

  // Toggle zone circle visibility
  function toggleZoneCircle() {
    const circle = document.getElementById('user-zone-circle');
    if (circle) {
      const isVisible = circle.style.opacity !== '0';
      circle.style.opacity = isVisible ? '0' : '0.7';
      circle.style.pointerEvents = isVisible ? 'none' : 'auto';
    }
  }

  // Add click event listener to zone circle
  function initializeZoneCircle() {
    const circle = document.getElementById('user-zone-circle');
    if (circle) {
      // Add click event to show "How One Things Work" popup
      circle.addEventListener('click', function(e) {
        e.stopPropagation();
        showHowOneThingsWorkPopup();
      });

      // Add double-click event to show info (keep for compatibility)
      circle.addEventListener('dblclick', function(e) {
        e.stopPropagation();
        showHowOneThingsWorkPopup();
      });
    }
  }

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
      interactive: false,
      // Add performance optimizations
      renderWorldCopies: false,
      maxZoom: 10,
      minZoom: 3
    });

    // Initialize zone circle size
    updateZoneCircleSize(5.5);

    // Initialize zone circle interactions immediately
    initializeZoneCircle();

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
  function geocodeLocation(lat, lon, callback) {
    callback(parseFloat(lat), parseFloat(lon));
//    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
////    fetch(API_CITIES + `https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(query)}`)
//      .then(res => res.json())
//      .then(data => {
//        if (data && data.length > 0) {
//          const lat = parseFloat(data[0].lat);
//          const lon = parseFloat(data[0].lon);
//          callback(lat, lon);
//        } else {
//          fallbackLocation(callback);
//        }
//      })
//      .catch(() => fallbackLocation(callback));
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
//    const manualLocation = localStorage.getItem("userLocation");

    const manualLat = localStorage.getItem("userLat");
    const manualLon = localStorage.getItem("userLon");
    if (manualLat && manualLon) {
      geocodeLocation(manualLat, manualLon, initializeMap);
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
          // Save user avatar to localStorage for author display
          const avatarUrl = data.picture.startsWith('http') ? data.picture : `https://xu8w-at8q-hywg.n7d.xano.io${data.picture}`;
          localStorage.setItem('userAvatar', avatarUrl);
          
          const userAvatar = document.getElementById('user-avatar');
          const progressAvatar = document.getElementById('progress-avatar');
          const levelsAvatar = document.getElementById('levels-avatar');

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
          // Save user name to localStorage for author display
          localStorage.setItem('userName', data.name);
          
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
          // Save user email to localStorage for author display
          localStorage.setItem('userEmail', data.email);

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
        
        // Update sticky user summary after loading user data
        updateStickyUserSummary();
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
      
      // Update sticky user summary when location changes
      updateStickyUserSummary();
    }

    function showLocationPrompt() {
      // Open our custom location modal instead of system prompt
      const locationModal = document.getElementById('location-modal');
      if (locationModal) {
        locationModal.classList.add('show');
        // Focus on input field
        const locationInput = document.getElementById('location-input');
        if (locationInput) {
          setTimeout(() => {
            locationInput.focus();
            // Move cursor to end instead of selecting all text
            locationInput.setSelectionRange(locationInput.value.length, locationInput.value.length);
          }, 100);
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

  // My Referrals modal functionality
  function initializeMyReferralsModal() {
    const myReferralsBtn = document.getElementById('my-referrals-btn');
    const myReferralsModal = document.getElementById('my-referrals-modal');
    const closeModalBtn = document.getElementById('close-my-referrals-modal');
    const copyBtn = document.getElementById('copy-referral-btn');
    const shareBtn = document.getElementById('share-referral-btn');
    const referralCodeElement = document.getElementById('referral-link-code');
    const userDropdown = document.getElementById('user-dropdown');

    // Generate referral code (you can replace this with actual user ID from Xano)
    const referralCode = '1964-2207'; // This should come from user data
    const referralLink = `globio.io/one-thing?ref=${referralCode}`;
    
    // Set referral code in display
    referralCodeElement.textContent = referralCode;

    // Open modal
    myReferralsBtn.addEventListener('click', () => {
      userDropdown.classList.remove('show');
      myReferralsModal.classList.add('show');
    });

    // Close modal
    closeModalBtn.addEventListener('click', () => {
      myReferralsModal.classList.remove('show');
    });

    // Close modal when clicking outside
    myReferralsModal.addEventListener('click', (e) => {
      if (e.target === myReferralsModal) {
        myReferralsModal.classList.remove('show');
      }
    });

    // Copy referral link
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(referralLink);
        // Show success feedback
        copyBtn.style.background = '#B1E530';
        copyBtn.innerHTML = '<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c456ad0331f5ca11d27c0f_check.svg" alt="Copied" width="24" height="24">';
        setTimeout(() => {
          copyBtn.style.background = 'transparent';
          copyBtn.innerHTML = '<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4522bf8804bd3b586530a_copy-06.svg" alt="Copy" width="24" height="24">';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = referralLink;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
    });

    // Share referral link
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: 'Join me on Globio One Thing!',
          text: 'Discover amazing things in your area with Globio One Thing',
          url: `https://${referralLink}`
        });
      } else {
        // Fallback: copy to clipboard
        copyBtn.click();
      }
    });

    // Load referral stats (you can replace this with actual API call)
    const referralCount = 0; // This should come from API
    document.getElementById('referral-count').textContent = referralCount;
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
              setTimeout(() => {
                locationInput.focus();
                // Move cursor to end instead of selecting all text
                locationInput.setSelectionRange(locationInput.value.length, locationInput.value.length);
              }, 100);
            }
          }
        });
      }
    }
      
      // Update sticky user summary when location changes from modal
      updateStickyUserSummary();
  }

  // Location Modal functionality
  function initializeLocationModal() {
    const locationModal = document.getElementById('location-modal');
    const closeLocationModal = document.getElementById('close-location-modal');
    const locationInput = document.getElementById('location-input');
    const locationIcon = document.querySelector('.location-modal-icon');

    const locationDetectBtn = document.getElementById('location-detect-btn');
    const locationResults = document.getElementById('location-results');

    // Removed conflicting click handler that was interfering with location selection

    // Handle input changes to show/hide location icon
    if (locationInput && locationIcon) {
      locationInput.addEventListener('input', () => {
        if (locationInput.value.trim().length > 0) {
          locationIcon.classList.add('hidden');
          locationIcon.style.display = 'none';
        } else {
          locationIcon.classList.remove('hidden');
          locationIcon.style.display = 'flex';
        }
      });
    }

    // Open location modal when clicking on location section
    const locationClickable = document.getElementById('location-clickable');
    if (locationClickable) {
      locationClickable.addEventListener('click', () => {
        locationModal.classList.add('show');
        // Focus on input but don't select all text
        setTimeout(() => {
          locationInput.focus();
          // Move cursor to end instead of selecting all text
          locationInput.setSelectionRange(locationInput.value.length, locationInput.value.length);
        }, 100);
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
        locationIcon.style.display = 'flex';
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
    async function searchLocationOld(query) {
      if (!query.trim()) return;

      // Show loading state with spinner only
      locationResults.innerHTML = '<div class="location-result-item loading"><div class="location-spinner"></div></div>';

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();

        displayLocationResultsOld(data);
      } catch (error) {
        locationResults.innerHTML = '<div class="location-result-item error"><div class="location-error-icon"><img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6889eb961e515115851948da_9c301540e2805651f3355e19910b6585_pin-2.svg" alt="Error" width="20" height="20"></div><div class="location-content"><div class="location-name">Search error</div><div class="location-details">Please try again</div></div></div>';
      }
    }


    // Search location functionality
    async function searchLocation(query) {
      if (!query.trim()) return;

      // Hide location icon when search starts
      if (locationIcon) {
        locationIcon.classList.add('hidden');
        locationIcon.style.display = 'none';
      }

      // Show loading state with spinner only
      locationResults.innerHTML = '<div class="location-result-item loading"><div class="location-spinner"></div></div>';
      query = query + '%';

      try {
        const response = await fetch(API_CITIES + `?city=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();

        displayLocationResults(data.items);
      } catch (error) {
        locationResults.innerHTML = '<div class="location-result-item error"><div class="location-error-icon"><img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6889eb961e515115851948da_9c301540e2805651f3355e19910b6585_pin-2.svg" alt="Error" width="20" height="20"></div><div class="location-content"><div class="location-name">Search error</div><div class="location-details">Please try again</div></div></div>';
      }
    }


    // Display search results
    function displayLocationResultsOld(results) {
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
        locationResults.addEventListener('mousedown', (e) => {
          const item = e.target.closest('.location-result-item');
          if (!item) return;

          // Prevent event bubbling to avoid triggering other handlers
          e.preventDefault();
          e.stopPropagation();

          // Focus removed to prevent selection issues - handled by event prevention

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

          // Reload page to update the map with new location
          setTimeout(() => {
            location.reload();
          }, 1000);
        });
      }
    }


    // Display search results
    function displayLocationResults(results) {
      if (results.length === 0) {
        locationResults.innerHTML = '<div class="location-result-item no-results"><div class="location-icon"><img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6889eb961e515115851948da_9c301540e2805651f3355e19910b6585_pin-2.svg" alt="Location" width="20" height="20"></div><div class="location-content"><div class="location-name">No locations found</div><div class="location-details">Try a different search term</div></div></div>';
        return;
      }

       locationResults.innerHTML = results.map(result => {
        const displayName = result.city + ', ' + result.country;
        return `
          <div class="location-result-item" data-lat="${result.lat}" data-lon="${result.lng}" data-display-name="${displayName}" data-city-id="${result.id}">
            <div class="location-icon"><img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6889eb961e515115851948da_9c301540e2805651f3355e19910b6585_pin-2.svg" alt="Location" width="20" height="20"></div>
            <div class="location-content">
              <div class="location-name">${result.city}</div>
              <div class="location-details">${displayName}</div>
            </div>
          </div>
        `;
      }).join('');

      // Add click handlers to results (use event delegation to avoid multiple handlers)
      if (!locationResults.hasAttribute('data-handler-attached')) {
        locationResults.setAttribute('data-handler-attached', 'true');
        locationResults.addEventListener('mousedown', (e) => {
          const item = e.target.closest('.location-result-item');
          if (!item) return;

          // Prevent event bubbling to avoid triggering other handlers
          e.preventDefault();
          e.stopPropagation();

          // Focus removed to prevent selection issues - handled by event prevention

          const lat = item.dataset.lat;
          const lon = item.dataset.lon;
          let displayName = item.dataset.displayName;
          let cityId = item.dataset.cityId;

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
          localStorage.setItem('userLat', lat);
          localStorage.setItem('userLon', lon);
          localStorage.setItem('userCityId', cityId);

          // Close modal immediately
          closeModal();

          // Show location success message
          showLocationSuccessTooltip();

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
        // Show location icon again when input is empty
        if (locationIcon) {
          locationIcon.classList.remove('hidden');
          locationIcon.style.display = 'flex';
        }
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
    locationInput.addEventListener('blur', (e) => {
      // Don't search if the blur is caused by clicking on a location result item
      if (e.relatedTarget && e.relatedTarget.closest('.location-result-item')) {
        return;
      }
      
      const query = locationInput.value.trim();
      if (query && query.length >= 2) {
        searchLocation(query);
      }
    });

    // Use current location - DISABLED
    // locationDetectBtn.addEventListener('click', async () => {
    //   if (navigator.geolocation) {
    //     try {
    //       const position = await new Promise((resolve, reject) => {
    //         navigator.geolocation.getCurrentPosition(resolve, reject);
    //       });

    //       const { latitude, longitude } = position.coords;

    //       // Reverse geocode to get location name
    //       const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
    //       const data = await response.json();

    //       if (data.display_name) {
    //         // Limit to city and country only
    //         let locationName = data.display_name;
    //         const parts = locationName.split(', ');
    //         if (parts.length > 2) {
    //           // Take city and country, skip detailed address
    //           const city = parts[0];
    //           const country = parts[parts.length - 1];
    //           locationName = `${city}, ${country}`;
    //         }

    //         localStorage.setItem('userLocation', locationName);

    //         // Close modal immediately
    //         closeModal();
    //         showLocationSuccessTooltip();

    //         // Reload page to update the map with new location
    //         setTimeout(() => {
    //           location.reload();
    //         }, 1000);
    //       }
    //     } catch (error) {
    //       showLocationErrorTooltip('Could not get your current location. Please try searching manually.');
    //     }
    //   } else {
    //     showLocationErrorTooltip('Geolocation is not supported by this browser.');
    //   }
    // });
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
  function checkHeic2AnyLibrary() {
    if (typeof heic2any !== 'undefined' && heic2any) {
      console.log('✅ HEIC2Any library is loaded and ready');
      return true;
    } else {
      console.warn('⚠️ HEIC2Any library is not loaded');
      return false;
    }
  }

  function initializeImagePopup() {
    const imagePopupModal = document.getElementById('image-popup-modal');
    const imagePopupClose = document.getElementById('image-popup-close');
    const imagePopupImg = document.getElementById('image-popup-img');
    const imagePopupOverlay = imagePopupModal.querySelector('.image-popup-overlay');

    // Close popup function
    function closeImagePopup() {
      imagePopupModal.classList.remove('show');
      document.body.style.overflow = '';
    }

    // Open popup function
    function openImagePopup(imageSrc) {
      imagePopupImg.src = imageSrc;
      imagePopupModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }

    // Close button click
    imagePopupClose.addEventListener('click', closeImagePopup);

    // Overlay click to close
    imagePopupOverlay.addEventListener('click', closeImagePopup);

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && imagePopupModal.classList.contains('show')) {
        closeImagePopup();
      }
    });

    // Make openImagePopup globally available
    window.openImagePopup = openImagePopup;
  }

  function initializeEverything() {
    // Initialize core components first
    loadMap();
    initializeUserProfile();
    initializeLocation();
    initializeUserDropdown();
    initializeMyContextModal();
    initializeMyReferralsModal();
    initializeLocationModal();
    initializeImagePopup();
    initializeLogout();
    updateUserLevelBadge();
    initializeStickyUserSummary();
    
    // Initialize popups
    initializeConfirmationPopup();
    initializeReferralPopup();
    initializeCommunityEmptyPopup();
    initializeLevelsPopup();
    initializeRoleAchievementPopup();
    initializeHowOneThingsWorkPopup();
    
    // Check if HEIC2Any library is loaded after core initialization
    setTimeout(() => {
      checkHeic2AnyLibrary();
    }, 1000); // Check after 1 second to allow library to load
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

//  const API_SUGGEST = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/get_card';
  const API_SUGGEST = "https://placeapi-fyawhxapepddg6ap.westeurope-01.azurewebsites.net/api/Place"
  const API_SAVE_CARD = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/save_card';
  const API_USER_CARDS = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users_cards';
  const API_USER_CARDS_TEST = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users_cards_test';
  const API_USERS = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users';
  const API_SET_CARD_PUBLISH = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/set_card_param'
  const API_SET_CARD_UPLOAD_IMAGE = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/upload/image'
  const API_CITIES = 'https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_cities'
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
  // Local levels - for current location progress
  const localLevels = [
    { 
      level: 1, 
      name: "Visitor", 
      xp: 0, 
      description: "Just arrived in this place",
      requirements: { xp: 0, referrals: 0, customCards: 0, remixedCards: 0, places: 0, dailyThings: 0, localContext: 0, categoryBalance: 0 }
    },
    { 
      level: 2, 
      name: "Local", 
      xp: 50, 
      description: "Getting familiar with the area",
      requirements: { xp: 50, referrals: 0, customCards: 0, remixedCards: 0, places: 0, dailyThings: 0, localContext: 0, categoryBalance: 0 }
    },
    { 
      level: 3, 
      name: "Regular", 
      xp: 150, 
      description: "Becoming a regular here",
      requirements: { xp: 150, referrals: 0, customCards: 0, remixedCards: 0, places: 0, dailyThings: 0, localContext: 0, categoryBalance: 2 }
    },
    { 
      level: 4, 
      name: "Insider", 
      xp: 300, 
      description: "You know the local secrets",
      requirements: { xp: 300, referrals: 0, customCards: 0, remixedCards: 0, places: 3, dailyThings: 2, localContext: 0, categoryBalance: 0 }
    },
    { 
      level: 5, 
      name: "Native", 
      xp: 500, 
      description: "You're practically a local",
      requirements: { xp: 500, referrals: 0, customCards: 0, remixedCards: 0, places: 5, dailyThings: 3, localContext: 2, categoryBalance: 0 }
    },
    { 
      level: 6, 
      name: "Ambassador", 
      xp: 750, 
      description: "Representing this place",
      requirements: { xp: 750, referrals: 0, customCards: 0, remixedCards: 0, places: 7, dailyThings: 5, localContext: 3, categoryBalance: 0 }
    },
    { 
      level: 7, 
      name: "Guardian", 
      xp: 1000, 
      description: "Protecting this location",
      requirements: { xp: 1000, referrals: 2, customCards: 0, remixedCards: 0, places: 10, dailyThings: 7, localContext: 5, categoryBalance: 0 }
    },
    { 
      level: 8, 
      name: "Legend", 
      xp: 3000, 
      description: "A legend in this place",
      requirements: { xp: 3000, referrals: 8, customCards: 3, remixedCards: 2, places: 25, dailyThings: 20, localContext: 15, categoryBalance: 3 }
    }
  ];

  // Global levels - for overall progress across all locations
  const globalLevels = [
    { 
      level: 1, 
      name: "Wanderer", 
      xp: 0, 
      description: "Starting your global journey",
      requirements: { xp: 0, referrals: 0, customCards: 0, remixedCards: 0, places: 0, dailyThings: 0, localContext: 0, categoryBalance: 0 }
    },
    { 
      level: 2, 
      name: "Traveler", 
      xp: 200, 
      description: "Exploring multiple places",
      requirements: { xp: 200, referrals: 0, customCards: 0, remixedCards: 0, places: 0, dailyThings: 0, localContext: 0, categoryBalance: 0 }
    },
    { 
      level: 3, 
      name: "Explorer", 
      xp: 500, 
      description: "Discovering new territories",
      requirements: { xp: 500, referrals: 0, customCards: 0, remixedCards: 0, places: 0, dailyThings: 0, localContext: 0, categoryBalance: 2 }
    },
    { 
      level: 4, 
      name: "Adventurer", 
      xp: 1000, 
      description: "Seeking new adventures",
      requirements: { xp: 1000, referrals: 0, customCards: 0, remixedCards: 0, places: 5, dailyThings: 3, localContext: 0, categoryBalance: 0 }
    },
    { 
      level: 5, 
      name: "Pioneer", 
      xp: 2000, 
      description: "Leading exploration efforts",
      requirements: { xp: 2000, referrals: 0, customCards: 0, remixedCards: 0, places: 8, dailyThings: 5, localContext: 3, categoryBalance: 0 }
    },
    { 
      level: 6, 
      name: "Master", 
      xp: 4000, 
      description: "Master of exploration",
      requirements: { xp: 4000, referrals: 3, customCards: 0, remixedCards: 0, places: 12, dailyThings: 8, localContext: 5, categoryBalance: 0 }
    },
    { 
      level: 7, 
      name: "Legend", 
      xp: 8000, 
      description: "A global exploration legend",
      requirements: { xp: 8000, referrals: 5, customCards: 2, remixedCards: 0, places: 15, dailyThings: 12, localContext: 8, categoryBalance: 0 }
    },
    { 
      level: 8, 
      name: "Myth", 
      xp: 15000, 
      description: "The ultimate global explorer",
      requirements: { xp: 15000, referrals: 8, customCards: 3, remixedCards: 1, places: 20, dailyThings: 15, localContext: 10, categoryBalance: 0 }
    }
  ];

  // Progress tracking for both tabs
  let localXP = 0;
  let globalXP = 0;
  let currentLocalLevel = 1;
  let currentGlobalLevel = 1;
  let activeTab = 'local'; // Track which tab is currently active
  
  // Additional progress metrics
  let userReferrals = 0; // Number of friends invited via referral link
  let customCards = 0; // Number of custom cards created (not generated)
  let remixedCards = 0; // Number of cards that have been remixed by others
  
  // Category tracking
  let completedPlaces = 0; // Number of completed Places cards
  let completedDailyThings = 0; // Number of completed Daily Things cards
  let completedLocalContext = 0; // Number of completed Local Context cards
  
  // Detailed XP tracking
  let savedCardsCount = 0; // Cards saved (5 XP each)
  let cardsWithPhotos = 0; // Cards with photos (10 XP each)
  let publishedCards = 0; // Cards made public (20 XP each)
  let completedCardsCount = 0; // Cards completed (15 XP each)
  let publishedCompletedCards = 0; // Completed cards made public (+10 XP bonus)
  
  // Role achievement tracking
  let lastLocalLevel = 1;
  let lastGlobalLevel = 1;

  // Update additional progress metrics
  function updateProgressMetrics() {
    // Count completed cards by category
    completedPlaces = completedCards.filter(card => card.category === 'places').length;
    completedDailyThings = completedCards.filter(card => card.category === 'daily').length;
    completedLocalContext = completedCards.filter(card => card.category === 'local').length;
    
    // Count detailed XP metrics
    savedCardsCount = savedCards.length;
    cardsWithPhotos = completedCards.filter(card => card.photo && card.photo !== '').length;
    publishedCards = completedCards.filter(card => card.published).length;
    completedCardsCount = completedCards.length;
    publishedCompletedCards = completedCards.filter(card => card.published && card.completed).length;
    
    // In a real app, these would come from API calls
    // For demo purposes, we'll simulate some data
    userReferrals = Math.floor(Math.random() * 3); // Simulate 0-2 referrals (reduced for later roles)
    customCards = Math.floor(Math.random() * 2); // Simulate 0-1 custom cards
    remixedCards = Math.floor(Math.random() * 1); // Simulate 0-1 remixed cards
    
    // Update referral count in UI
    const referralCountElement = document.getElementById('referral-count');
    if (referralCountElement) {
      referralCountElement.textContent = userReferrals;
    }
  }

  // Show role achievement popup
  function showRoleAchievementPopup(roleData, tabType) {
    // Show popup only for local roles
    if (tabType !== 'local') return;
    
    const popup = document.getElementById('role-achievement-popup');
    const avatar = document.getElementById('achievement-avatar');
    const roleName = document.getElementById('achievement-role-name');
    const roleBadge = document.getElementById('achievement-role-badge');
    const dynamicVisual = document.getElementById('achievement-dynamic-visual');
    
    if (!popup || !avatar || !roleName || !roleBadge || !dynamicVisual) return;
    
    // Update avatar
    const userAvatar = document.getElementById('user-avatar');
    if (userAvatar && userAvatar.src) {
      avatar.src = userAvatar.src;
    }
    
    // Update role information
    roleName.textContent = roleData.name;
    
    // Apply role-specific color to badge
    const localColors = {
      1: '#9CA3AF', 2: '#4ADE80', 3: '#22C55E', 4: '#0EA5E9',
      5: '#2563EB', 6: '#7C3AED', 7: '#D97706', 8: '#EAB308'
    };
    
    const roleColor = localColors[roleData.level] || '#B1E530';
    roleBadge.style.color = roleColor;
    roleBadge.style.background = `${roleColor}20`;
    roleBadge.style.borderColor = `${roleColor}33`;
    
    // Update dynamic visual based on role level
    const localVisuals = {
      1: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125978b3f6756bdd1344c_01-Visitor.svg', // Visitor
      2: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c12597cae559b96926b1f5_02-Local.svg', // Local
      3: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125976b32833c22afd1b9_03-Regular.svg', // Regular
      4: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125973fef6ffd2269b985_04-Insider.svg', // Insider
      5: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125979527a790ca7de1d6_05-Native.svg', // Native
      6: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c1259711585667f0bde54c_06-Ambassador.svg', // Ambassador
      7: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c12597ae8a938e130dd2a2_07-Guardian.svg', // Guardian
      8: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c12597f36fa951c2bfc1d6_09-Legend.svg'  // Legend
    };
    
    const visualUrl = localVisuals[roleData.level] || 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125978b3f6756bdd1344c_01-Visitor.svg';
    dynamicVisual.src = visualUrl;
    
    // Show popup
    popup.classList.add('show');
  }

  // Hide role achievement popup
  function hideRoleAchievementPopup() {
    const popup = document.getElementById('role-achievement-popup');
    if (popup) {
      popup.classList.remove('show');
    }
  }

  // Check for role achievements
  function checkRoleAchievements() {
    const progress = calculateUserXP();
    const newLocalLevel = progress.local.level;
    const newGlobalLevel = progress.global.level;
    
    // Check for local role achievement
    if (newLocalLevel > lastLocalLevel) {
      const roleData = localLevels.find(level => level.level === newLocalLevel);
      if (roleData) {
        showRoleAchievementPopup(roleData, 'local');
      }
      lastLocalLevel = newLocalLevel;
    }
    
    // Check for global role achievement
    if (newGlobalLevel > lastGlobalLevel) {
      const roleData = globalLevels.find(level => level.level === newGlobalLevel);
      if (roleData) {
        showRoleAchievementPopup(roleData, 'global');
      }
      lastGlobalLevel = newGlobalLevel;
    }
  }

  // Test function to show role achievement popup (for demo purposes)
  function testRoleAchievementPopup() {
    const testRoleData = {
      level: 3,
      name: "Regular",
      description: "Becoming a regular here"
    };
    showRoleAchievementPopup(testRoleData, 'local');
  }

  // Make test function available globally for demo
  window.testRoleAchievementPopup = testRoleAchievementPopup;


  // Test function to simulate different XP levels for demo
  function testXPProgress() {
    // Simulate different XP levels to test progress display
    localXP = 75; // Between Local (50) and Regular (150)
    globalXP = 350; // Between Traveler (200) and Explorer (500)
    updateUserLevelBadge();
    
    // Re-initialize levels popup to see changes
    const levelsPopup = document.getElementById('levels-popup');
    if (levelsPopup) {
      levelsPopup.classList.add('show');
    }
  }

  // Show XP gain notification
  function showXPGainNotification(xpAmount, action) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'xp-gain-notification';
    notification.innerHTML = `
      <div class="xp-gain-content">
        <span class="xp-gain-icon">⚡</span>
        <span class="xp-gain-text">+${xpAmount} XP</span>
        <span class="xp-gain-action">${action}</span>
      </div>
    `;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Remove after animation
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 2000);
  }

  // Award XP for specific actions
  function awardXP(action, amount) {
    // Update progress metrics first
    updateProgressMetrics();
    
    // Show notification
    showXPGainNotification(amount, action);
    
    // Update UI
    updateUserLevelBadge();
    checkRoleAchievements();
  }

  // Test function for XP system
  function testXPSystem() {
    // Test different XP actions
    awardXP('Saved card', 5);
    
    setTimeout(() => {
      awardXP('Added photo', 10);
    }, 500);
    
    setTimeout(() => {
      awardXP('Made public', 20);
    }, 1000);
    
    setTimeout(() => {
      awardXP('Completed card', 15);
    }, 1500);
    
    setTimeout(() => {
      awardXP('Published completed', 10);
    }, 2000);
  }

  // Test function for tooltips
  function testTooltips() {
    // Simulate some progress to see tooltips
    completedPlaces = 2;
    completedDailyThings = 1;
    completedLocalContext = 0;
    userReferrals = 1;
    customCards = 0;
    remixedCards = 0;
    
    // Update and show levels popup
    updateProgressMetrics();
    const levelsPopup = document.getElementById('levels-popup');
    if (levelsPopup) {
      levelsPopup.classList.add('show');
    }
  }

  // Smart tooltip positioning to prevent clipping
  function setupSmartTooltips() {
    const chips = document.querySelectorAll('.requirement-chip[data-tooltip]');
    
    chips.forEach(chip => {
      chip.addEventListener('mouseenter', function() {
        const popup = document.getElementById('levels-popup');
        if (!popup) return;
        
        // Get positions
        const chipRect = this.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        
        // Estimate tooltip width based on content
        const tooltipText = this.getAttribute('data-tooltip');
        const estimatedWidth = Math.min(tooltipText.length * 7 + 32, 300); // Rough estimation
        
        // Calculate tooltip position if centered
        const chipCenterX = chipRect.left + (chipRect.width / 2);
        const tooltipLeft = chipCenterX - (estimatedWidth / 2);
        const tooltipRight = chipCenterX + (estimatedWidth / 2);
        
        // Check boundaries with padding
        const padding = 20;
        const popupLeft = popupRect.left + padding;
        const popupRight = popupRect.right - padding;
        
        let transformValue = 'translateX(-50%)';
        
        if (tooltipLeft < popupLeft) {
          // Too far left - align to left edge of popup
          const offset = popupLeft - chipCenterX;
          transformValue = `translateX(calc(-50% + ${offset}px))`;
        } else if (tooltipRight > popupRight) {
          // Too far right - align to right edge of popup
          const offset = chipCenterX - popupRight;
          transformValue = `translateX(calc(-50% - ${offset}px))`;
        }
        
        this.style.setProperty('--tooltip-transform', transformValue);
      });
    });
  }

  // Make test functions available globally for demo
  window.testXPProgress = testXPProgress;
  window.testXPSystem = testXPSystem;
  window.testTooltips = testTooltips;

  // Calculate user XP based on activities
  function calculateUserXP() {
    // Detailed XP calculation based on specific actions
    // Save cards: 5 XP each
    const saveXP = savedCardsCount * 5;
    
    // Cards with photos: 10 XP each
    const photoXP = cardsWithPhotos * 10;
    
    // Published cards: 20 XP each
    const publishXP = publishedCards * 20;
    
    // Completed cards: 15 XP each
    const completeXP = completedCardsCount * 15;
    
    // Published completed cards: +10 XP bonus
    const publishedCompleteBonus = publishedCompletedCards * 10;
    
    // Total XP calculation
    const totalXP = saveXP + photoXP + publishXP + completeXP + publishedCompleteBonus;

    // Local XP: Only current location activities (simplified for demo)
    // In real app, this would filter by current location
    localXP = Math.floor(totalXP * 0.7); // 70% for local progress

    // Global XP: All activities across all locations
    globalXP = totalXP; // 100% for global progress

    // Find current local level - check all requirements, not just XP
    currentLocalLevel = 1; // Default to level 1
    for (let i = 0; i < localLevels.length; i++) {
      const level = localLevels[i];
      const req = level.requirements;
      
      // Check category balance requirement
      let categoryBalanceMet = true;
      if (req.categoryBalance > 0) {
        const categoriesWithProgress = [
          completedPlaces > 0,
          completedDailyThings > 0,
          completedLocalContext > 0
        ].filter(Boolean).length;
        categoryBalanceMet = categoriesWithProgress >= req.categoryBalance;
      }
      
      if (localXP >= req.xp && 
          userReferrals >= req.referrals &&
          customCards >= req.customCards &&
          remixedCards >= req.remixedCards &&
          completedPlaces >= req.places &&
          completedDailyThings >= req.dailyThings &&
          completedLocalContext >= req.localContext &&
          categoryBalanceMet) {
        currentLocalLevel = level.level;
      } else {
        break;
      }
    }

    // Find current global level - check all requirements, not just XP
    currentGlobalLevel = 1; // Default to level 1
    for (let i = 0; i < globalLevels.length; i++) {
      const level = globalLevels[i];
      const req = level.requirements;
      
      // Check category balance requirement
      let categoryBalanceMet = true;
      if (req.categoryBalance > 0) {
        const categoriesWithProgress = [
          completedPlaces > 0,
          completedDailyThings > 0,
          completedLocalContext > 0
        ].filter(Boolean).length;
        categoryBalanceMet = categoriesWithProgress >= req.categoryBalance;
      }
      
      if (globalXP >= req.xp && 
          userReferrals >= req.referrals &&
          customCards >= req.customCards &&
          remixedCards >= req.remixedCards &&
          completedPlaces >= req.places &&
          completedDailyThings >= req.dailyThings &&
          completedLocalContext >= req.localContext &&
          categoryBalanceMet) {
        currentGlobalLevel = level.level;
      } else {
        break;
      }
    }

    return { 
      local: { xp: localXP, level: currentLocalLevel },
      global: { xp: globalXP, level: currentGlobalLevel }
    };
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
      activeTab = 'local';
      updateTabDescription('local');
      updateProgressDisplay('local');
      populateLevelsList('local');
    });

    globalTab.addEventListener('click', () => {
      globalTab.classList.add('active');
      localTab.classList.remove('active');
      activeTab = 'global';
      updateTabDescription('global');
      updateProgressDisplay('global');
      populateLevelsList('global');
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

  // Initialize sticky user summary
  function initializeStickyUserSummary() {
    const stickySummary = document.getElementById('sticky-user-summary');
    const userAvatar = document.getElementById('user-avatar');
    const stickyLevelBadge = document.getElementById('sticky-level-badge');
    
    if (!stickySummary || !userAvatar) return;

    // Update sticky summary content
    updateStickyUserSummary();

    // Add click handler to sticky level badge to open levels popup
    if (stickyLevelBadge) {
      stickyLevelBadge.addEventListener('click', () => {
        const levelsPopup = document.getElementById('levels-popup');
        if (levelsPopup) {
          levelsPopup.classList.add('show');
        }
      });
    }

    // Handle scroll to show/hide sticky summary
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const shouldShow = scrollY > 100;
      
      if (shouldShow) {
        stickySummary.classList.add('show');
      } else {
        stickySummary.classList.remove('show');
      }
    });
  }

  // Update sticky user summary content
  function updateStickyUserSummary() {
    const stickyAvatar = document.getElementById('sticky-user-avatar');
    const stickyLocationName = document.getElementById('sticky-location-name');
    const userAvatar = document.getElementById('user-avatar');
    
    if (!stickyAvatar || !stickyLocationName) return;

    // Copy avatar from main user avatar (which is already loaded from Xano)
    if (userAvatar && userAvatar.src) {
      stickyAvatar.src = userAvatar.src;
      // Add error handling for sticky avatar
      stickyAvatar.onerror = function() {
        this.src = 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6883c7a80506f986b2f7ddb7_db85210bbfb795678a1578319074aaf4_placeholder.svg';
      };
    }

    // Get current location from window.userLocation (same as Location Section)
    const currentLocation = window.userLocation || 'your place';
    
    // Update location name only
    stickyLocationName.textContent = currentLocation;
    
    // Level badge is now updated in updateUserLevelBadge function
  }

  // Update user level badge with colors
  function updateUserLevelBadge() {
    const levelBadge = document.getElementById('user-level-badge');
    const stickyLevelBadge = document.getElementById('sticky-level-badge');
    
    if (!levelBadge) return;

    const progress = calculateUserXP();
    const currentLevel = progress.local.level; // Always use local level for user badge
    
    // Define colors for local levels
    const localColors = {
      1: '#9CA3AF', // Visitor
      2: '#4ADE80', // Local
      3: '#22C55E', // Regular
      4: '#0EA5E9', // Insider
      5: '#2563EB', // Native
      6: '#7C3AED', // Ambassador
      7: '#D97706', // Guardian
      8: '#EAB308'  // Legend
    };

    // Show the current level (the one user is working towards)
    const currentLevelData = localLevels.find(level => level.level === currentLevel);
    if (currentLevelData) {
      // Update main badge
      levelBadge.textContent = currentLevelData.name;
      
      // Apply colors to main badge
      const roleColor = localColors[currentLevel];
      levelBadge.style.background = `${roleColor}20`; // 20% opacity
      levelBadge.style.borderColor = roleColor;
      levelBadge.style.color = roleColor;
      
      // Update sticky badge with same logic
      if (stickyLevelBadge) {
        stickyLevelBadge.textContent = currentLevelData.name;
        stickyLevelBadge.style.background = `${roleColor}20`; // 20% opacity
        stickyLevelBadge.style.borderColor = roleColor;
        stickyLevelBadge.style.color = roleColor;
      }
    }

    // Update sticky summary content
    updateStickyUserSummary();
  }

  // Update dynamic visual based on level
  function updateDynamicVisual(level, tabType = 'local') {
    const dynamicVisual = document.getElementById('dynamic-visual');
    if (!dynamicVisual) return;

    // Define visual URLs for different levels and tab types
    const localVisualUrls = {
      1: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125978b3f6756bdd1344c_01-Visitor.svg', // Visitor
      2: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c12597cae559b96926b1f5_02-Local.svg', // Local
      3: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125976b32833c22afd1b9_03-Regular.svg', // Regular
      4: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125973fef6ffd2269b985_04-Insider.svg', // Insider
      5: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c125979527a790ca7de1d6_05-Native.svg', // Native
      6: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c1259711585667f0bde54c_06-Ambassador.svg', // Ambassador
      7: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c12597ae8a938e130dd2a2_07-Guardian.svg', // Guardian
      8: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c12597f36fa951c2bfc1d6_09-Legend.svg'  // Legend
    };

    const globalVisualUrls = {
      1: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c129a78ac593e86b8ea520_01-Wanderer.svg', // Wanderer
      2: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c129a7109f56bcfbb3bde5_02-Traveler.svg', // Traveler
      3: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c129a75927df77f0806867_03-Explorer.svg', // Explorer
      4: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c129a7b7f3263d2c6e2596_04-Adventurer.svg', // Adventurer
      5: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c129a71deef2506979baba_05-Pioneer.svg', // Pioneer
      6: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c129a7d7b3ac5029d29107_06-Master.svg', // Master
      7: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c129a775ccf00f000786f6_07-Legend.svg', // Legend
      8: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c129a7609028457aa80150_08-Myth.svg'  // Myth
    };

    const visualUrls = tabType === 'local' ? localVisualUrls : globalVisualUrls;

    // Update visual source
    if (visualUrls[level]) {
      dynamicVisual.src = visualUrls[level];
    }
  }

  // Update progress display based on selected tab
  function updateProgressDisplay(tabType) {
    const progress = calculateUserXP();
    const levels = tabType === 'local' ? localLevels : globalLevels;
    const currentProgress = tabType === 'local' ? progress.local : progress.global;
    
    const currentLevelData = levels.find(l => l.level === currentProgress.level);
    const nextLevelData = levels.find(l => l.level === currentProgress.level + 1);

    if (!currentLevelData) return;

    const userXP = currentProgress.xp;
    
    // Update level badge in profile menu (use global for main badge)

    // Update dynamic visual based on level
    updateDynamicVisual(currentLevelData.level, tabType);

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


  // Create requirement chips for each level
  function createRequirementChips(requirements, levelNumber, tabType = 'local') {
    if (levelNumber === 1) return ''; // First level has no requirements
    
    const currentXP = tabType === 'local' ? localXP : globalXP;
    const chips = [];
    
    // XP requirement
    if (requirements.xp > 0) {
      const isCompleted = currentXP >= requirements.xp;
      const icon = isCompleted ? 
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c69757117bb751fdfcb924_done-requirments.svg" alt="✓" class="requirement-icon">` :
        '';
      chips.push(`<span class="requirement-chip ${isCompleted ? 'completed' : 'pending'}">${icon}${requirements.xp} XP</span>`);
    }
    
    // Category balance requirement
    if (requirements.categoryBalance > 0) {
      const categoriesWithProgress = [
        completedPlaces > 0,
        completedDailyThings > 0,
        completedLocalContext > 0
      ].filter(Boolean).length;
      const isCompleted = categoriesWithProgress >= requirements.categoryBalance;
      chips.push(`<span class="requirement-chip ${isCompleted ? 'completed' : 'pending'}" data-tooltip="Complete cards from ${requirements.categoryBalance} different categories">${requirements.categoryBalance} categories</span>`);
    }
    
    // Places requirement
    if (requirements.places > 0) {
      const isCompleted = completedPlaces >= requirements.places;
      const icon = isCompleted ? 
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c69757117bb751fdfcb924_done-requirments.svg" alt="✓" class="requirement-icon">` :
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c697571bc52240d6cc686f_places-requirments.svg" alt="📍" class="requirement-icon">`;
      chips.push(`<span class="requirement-chip ${isCompleted ? 'completed' : 'pending'}" data-tooltip="Complete ${requirements.places} place-related cards">${icon} ${requirements.places} places</span>`);
    }
    
    // Daily Things requirement
    if (requirements.dailyThings > 0) {
      const isCompleted = completedDailyThings >= requirements.dailyThings;
      const icon = isCompleted ? 
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c69757117bb751fdfcb924_done-requirments.svg" alt="✓" class="requirement-icon">` :
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c6975708a0af94ec5eee35_daily-requirments.svg" alt="📅" class="requirement-icon">`;
      chips.push(`<span class="requirement-chip ${isCompleted ? 'completed' : 'pending'}" data-tooltip="Complete ${requirements.dailyThings} daily activity cards">${icon} ${requirements.dailyThings} daily things</span>`);
    }
    
    // Local Context requirement
    if (requirements.localContext > 0) {
      const isCompleted = completedLocalContext >= requirements.localContext;
      const icon = isCompleted ? 
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c69757117bb751fdfcb924_done-requirments.svg" alt="✓" class="requirement-icon">` :
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c69757497f18f550f1d61e_context-requirments.svg" alt="🏠" class="requirement-icon">`;
      chips.push(`<span class="requirement-chip ${isCompleted ? 'completed' : 'pending'}" data-tooltip="Complete ${requirements.localContext} local context cards">${icon} ${requirements.localContext} local context</span>`);
    }
    
    // Referrals requirement
    if (requirements.referrals > 0) {
      const isCompleted = userReferrals >= requirements.referrals;
      const icon = isCompleted ? 
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c69757117bb751fdfcb924_done-requirments.svg" alt="✓" class="requirement-icon">` :
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c698a131719af3c7c747ed_refferals-requirments.svg" alt="👥" class="requirement-icon">`;
      chips.push(`<span class="requirement-chip ${isCompleted ? 'completed' : 'pending'}" data-tooltip="Invite ${requirements.referrals} friends to join the platform">${icon} ${requirements.referrals} referrals</span>`);
    }
    
    // Custom cards requirement
    if (requirements.customCards > 0) {
      const isCompleted = customCards >= requirements.customCards;
      const icon = isCompleted ? 
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c69757117bb751fdfcb924_done-requirments.svg" alt="✓" class="requirement-icon">` :
        `<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c698a0b0931ec8d45fcd8a_custom-requirments.svg" alt="✨" class="requirement-icon">`;
      chips.push(`<span class="requirement-chip ${isCompleted ? 'completed' : 'pending'}" data-tooltip="Create ${requirements.customCards} your own custom cards">${icon} ${requirements.customCards} custom cards</span>`);
    }
    
    // Remixed cards requirement
    if (requirements.remixedCards > 0) {
      const isCompleted = remixedCards >= requirements.remixedCards;
      chips.push(`<span class="requirement-chip ${isCompleted ? 'completed' : 'pending'}" data-tooltip="Have ${requirements.remixedCards} of your cards remixed by other users">🔄 ${requirements.remixedCards} remixed cards</span>`);
    }
    
    if (chips.length === 0) return '';
    
    return `<div class="requirement-chips">
      ${chips.join('')}
    </div>`;
  }

  // Populate levels list based on active tab
  function populateLevelsList(tabType) {
    const levelsList = document.getElementById('levels-list');
    if (!levelsList) return;

    const levels = tabType === 'local' ? localLevels : globalLevels;
    const progress = calculateUserXP();
    const currentProgress = tabType === 'local' ? progress.local : progress.global;
    const currentLevel = currentProgress.level;

    // Define colors for each level
    const localColors = {
      1: '#9CA3AF', // Visitor
      2: '#4ADE80', // Local
      3: '#22C55E', // Regular
      4: '#0EA5E9', // Insider
      5: '#2563EB', // Native
      6: '#7C3AED', // Ambassador
      7: '#D97706', // Guardian
      8: '#EAB308'  // Legend
    };

    const globalColors = {
      1: '#94A3B8', // Wanderer
      2: '#38BDF8', // Traveler
      3: '#14B8A6', // Explorer
      4: '#2563EB', // Adventurer
      5: '#7C3AED', // Pioneer
      6: '#9333EA', // Master
      7: '#E11D48', // Legend
      8: '#FACC15'  // Myth
    };

    const colors = tabType === 'local' ? localColors : globalColors;

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

      // Determine colors based on status
      let backgroundColor, borderColor;
      if (level.level < currentLevel) {
        // Completed levels - black
        backgroundColor = '#000000';
        borderColor = '#000000';
      } else if (level.level === currentLevel) {
        // Current level - use role color
        backgroundColor = colors[level.level] || '#B1E530';
        borderColor = colors[level.level] || '#B1E530';
      } else {
        // Future levels - gray
        backgroundColor = '#ccc';
        borderColor = '#ccc';
      }

        // Create requirement chips
        const requirements = level.requirements;
        const requirementChips = createRequirementChips(requirements, level.level, tabType);
        
        levelItem.innerHTML = `
        <div class="level-avatar" style="background: ${backgroundColor}; border-color: ${borderColor}; color: ${level.level < currentLevel ? '#fff' : level.level === currentLevel ? '#fff' : '#666'}">
            ${level.level}
          </div>
          <div class="level-details">
            <div class="level-name">${level.name}</div>
            <div class="level-description">${level.description}</div>
            ${requirementChips}
          </div>
        `;

      // Apply background and border colors for current level
      if (level.level === currentLevel) {
        const roleColor = colors[level.level];
        levelItem.style.background = `${roleColor}20`; // 20% opacity
        levelItem.style.borderColor = roleColor;
      }

        levelsList.appendChild(levelItem);
      });
      
      // Setup smart tooltips for new elements
      setTimeout(() => {
        setupSmartTooltips();
      }, 50);
  }

  // Initialize levels popup
  function initializeLevelsPopup() {
    const levelsPopup = document.getElementById('levels-popup');
    const levelsClose = document.getElementById('levels-close');

    if (!levelsPopup || !levelsClose) {
      return;
    }

    // Update progress metrics first
    updateProgressMetrics();
    
    // Initialize tabs and populate levels list
    initializeProgressTabs();
    populateLevelsList('local'); // Start with local tab
    updateProgressDisplay('local'); // Initialize with local tab
    
    // Setup smart tooltips after a short delay to ensure DOM is ready
    setTimeout(() => {
      setupSmartTooltips();
    }, 100);

    // Scroll shadow logic
    const scrollableContent = levelsPopup.querySelector('.levels-scrollable-content');
    if (scrollableContent) {
      function handleScrollShadow() {
        const tabDescriptionContainer = document.querySelector('.tab-description-container');
        if (tabDescriptionContainer) {
          if (scrollableContent.scrollTop > 0) {
            tabDescriptionContainer.classList.add('scrolled');
          } else {
            tabDescriptionContainer.classList.remove('scrolled');
          }
        }
      }

      scrollableContent.addEventListener('scroll', handleScrollShadow);
      // Initial check
      handleScrollShadow();
    }


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

  // Initialize role achievement popup
  function initializeRoleAchievementPopup() {
    const popup = document.getElementById('role-achievement-popup');
    const closeBtn = document.getElementById('achievement-close-btn');
    const viewProgressBtn = document.getElementById('achievement-view-progress-btn');
    
    if (!popup || !closeBtn || !viewProgressBtn) return;
    
    // Close button handler
    closeBtn.addEventListener('click', hideRoleAchievementPopup);
    
    // View progress button handler
    viewProgressBtn.addEventListener('click', () => {
      hideRoleAchievementPopup();
      // Open levels popup
      const levelsPopup = document.getElementById('levels-popup');
      if (levelsPopup) {
        levelsPopup.classList.add('show');
      }
    });
    
    // Close on overlay click
    popup.addEventListener('click', (e) => {
      if (e.target === popup || e.target.classList.contains('role-achievement-overlay')) {
        hideRoleAchievementPopup();
      }
    });
  }

  // Initialize progress bar system
  function initializeProgressBar() {

    initializeLevelsPopup();
    initializeRoleAchievementPopup();



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
      updateProgressMetrics();
      updateUserLevelBadge();
      checkRoleAchievements();
    };

    loadCompletedUserCards = function() {
      originalLoadCompletedUserCards.call(this);
      updateProgressMetrics();
      updateUserLevelBadge();
      checkRoleAchievements();
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
          } else if (action === 'delete') {
            deleteCardFromServer(cardId);
            hideConfirmationPopup();
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
//    let qs = '?';
//    for (const key in context) {
//      if (context.hasOwnProperty(key)) qs += encodeURIComponent(key) + '=' + encodeURIComponent(context[key]) + '&';
//    }
    fetch(API_SUGGEST, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              lat: localStorage.getItem('userLat'),
              lng: localStorage.getItem('userLon'),
              kids: (localStorage.getItem('hasKids') === 'true'),
              pets: (localStorage.getItem('hasPets') === 'true'),
              car: (localStorage.getItem('hasCar') === 'true'),
              excludeIds: []
          })
    })
    .then(res => res.json())
    .then(data => {
        btn.classList.remove('loading');
        stopLoadingAnimation();

        let dataParams = Object.assign(data, {forsquareId: data.id});

        fetch(API_SAVE_CARD, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(dataParams)
        })
        .then(res => res.json())
        .then(dataResponse => {
            currentSuggestion = {
              id: dataResponse.id,
//              id: data.id || data.card_id || data.cardId || data.card?.id || data.item?.id || data.thing?.id || data.name || 'generated-' + Date.now(),
              title: dataResponse.title || dataResponse.name || 'No Tip This Time',
              description: dataResponse.description || 'Sometimes even the best advice needs a rest. Come back later.',
              category: dataResponse.category || dataResponse.card?.category || dataResponse.item?.category || dataResponse.thing?.category || 'places'
            };

            showPopup(currentSuggestion);
        });
      })
      .catch(err => {
        btn.classList.remove('loading');
        stopLoadingAnimation();
        
        // Show fallback card on error
        currentSuggestion = {
          id: 'fallback-' + Date.now(),
          title: 'No Tip This Time',
          description: 'Sometimes even the best advice needs a rest. Come back later.',
          category: 'fallback'
        };
        
        showPopup(currentSuggestion);
      });
  });

  btnSave.addEventListener('click', () => {
    if (!currentSuggestion) return;
    const userId = ensureUserId();
    let cityId = localStorage.getItem('userCityId');

    if (userId && currentSuggestion.id) {
      fetch(API_USER_CARDS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            one_thing_users_id: userId,
            one_thing_cards_id: currentSuggestion.id,
            expired_at: Date.now() + 1000 * 60 * 60 * 24 * 30,
            one_thing_cities_id: cityId
        })
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
//        imageSrc: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4324573885a3a9d06e6e9_add-photo-ot.avif',
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

    // Handle fallback cards specially
    const isFallback = card.category === 'fallback';
    const popupButtons = document.querySelector('.popup-buttons');
    const skipBtn = document.getElementById('popup-skip');
    const saveBtn = document.getElementById('popup-save');
    
    if (isFallback) {
      // Hide Skip/Save buttons for fallback cards
      skipBtn.style.display = 'none';
      saveBtn.style.display = 'none';
      
      // Create or update fallback button
      let fallbackBtn = document.getElementById('popup-fallback-btn');
      if (!fallbackBtn) {
        fallbackBtn = document.createElement('button');
        fallbackBtn.id = 'popup-fallback-btn';
        fallbackBtn.className = 'popup-fallback-btn';
        fallbackBtn.innerHTML = `
          <span>Try Again</span>
        `;
        popupButtons.appendChild(fallbackBtn);
        
        // Add click handler for fallback button
        fallbackBtn.addEventListener('click', () => {
          hidePopup();
          // Automatically trigger new card generation
          const oneThingBtn = document.getElementById('one-thing-btn');
          if (oneThingBtn) {
            oneThingBtn.click();
          }
        });
      }
      fallbackBtn.style.display = 'flex';
    } else {
      // Show normal buttons for regular cards
      skipBtn.style.display = 'flex';
      saveBtn.style.display = 'flex';
      
      // Hide fallback button if it exists
      const fallbackBtn = document.getElementById('popup-fallback-btn');
      if (fallbackBtn) {
        fallbackBtn.style.display = 'none';
      }
    }

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
    
    // Add click outside handler for fallback cards only
    if (isFallback) {
      const handleClickOutside = (e) => {
        if (e.target === popup) {
          hidePopup();
          popup.removeEventListener('click', handleClickOutside);
        }
      };
      popup.addEventListener('click', handleClickOutside);
    }
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
      'LOCAL-CONTEXT': 'Local Context',
      'fallback': 'Wooops'
    };
    return categories[category] || category || 'Places';
  }

  function getCategoryIcon(category) {
    const icons = {
      'places': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c7e017194725f4b9935fd0_b3b5a752b7759f16d1f0153fc3ab73bb_places-wc.avif',
      'daily': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c7e0175e67b782216cac03_daily-things-wc.avif',
      'local': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c7e017b95895d194199d31_local-context-wc.avif',
      'DAILY THINGS': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c7e0175e67b782216cac03_daily-things-wc.avif',
      'PLACES': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c7e017194725f4b9935fd0_b3b5a752b7759f16d1f0153fc3ab73bb_places-wc.avif',
      'LOCAL CONTEXT': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c7e017b95895d194199d31_local-context-wc.avif',
      'fallback': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c7e4096042d5b1882cd74e_fallback-wc.avif'
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
    restoreBodyScroll();
  }

  // Global functions for empty state buttons
  function scrollToGetOneThing() {
    // Scroll to top of page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Functions to prevent body scroll when popup is open
  function preventBodyScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }

  function restoreBodyScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }

  function showReferralPopup() {
    const userId = ensureUserId();
    const referralCode = userId ? userId.substring(0, 8) : 'YOURCODE';

    document.getElementById('referral-code').textContent = referralCode;
    document.getElementById('referral-popup').classList.add('show');
    preventBodyScroll();
  }

  function hideReferralPopup() {
    document.getElementById('referral-popup').classList.remove('show');
    restoreBodyScroll();
  }

  function copyReferralLink() {
    const userId = ensureUserId();
    const referralCode = userId ? userId.substring(0, 8) : 'YOURCODE';
    const fullLink = `https://globio.io/ref/${referralCode}`;

    navigator.clipboard.writeText(fullLink).then(() => {
      const copyBtn = document.getElementById('copy-referral-btn');
      copyBtn.innerHTML = '<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c456ad0331f5ca11d27c0f_check.svg" alt="Copied" width="24" height="24">';
      copyBtn.style.background = '#B1E530';

      setTimeout(() => {
        copyBtn.innerHTML = '<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4522bf8804bd3b586530a_copy-06.svg" alt="Copy" width="24" height="24">';
        copyBtn.style.background = 'transparent';
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
    preventBodyScroll();
  }

  function hideCommunityEmptyPopup() {
    document.getElementById('community-empty-popup').classList.remove('show');
    restoreBodyScroll();
  }

  function copyCommunityReferralLink() {
    const userId = ensureUserId();
    const referralCode = userId ? userId.substring(0, 8) : 'YOURCODE';
    const fullLink = `https://globio.io/ref/${referralCode}`;

    navigator.clipboard.writeText(fullLink).then(() => {
      const copyBtn = document.getElementById('copy-community-referral-btn');
      copyBtn.innerHTML = '<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c456ad0331f5ca11d27c0f_check.svg" alt="Copied" width="24" height="24">';
      copyBtn.style.background = '#B1E530';

      setTimeout(() => {
        copyBtn.innerHTML = '<img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4522bf8804bd3b586530a_copy-06.svg" alt="Copy" width="24" height="24">';
        copyBtn.style.background = 'transparent';
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
    
    // Get current user info for author display
    const userEmail = localStorage.getItem('userEmail') || 'User';
    const userAvatar = localStorage.getItem('userAvatar') || '';
    let userName = localStorage.getItem('userName');
    
    // Fallback: try to get name from DOM if not in localStorage
    if (!userName) {
      const userMenuName = document.getElementById('user-menu-name');
      if (userMenuName && userMenuName.textContent) {
        userName = userMenuName.textContent;
        localStorage.setItem('userName', userName);
      } else {
        userName = userEmail.split('@')[0] || 'User';
      }
    }
    
    // Add to publicCards array at the beginning with author info
    const publicCard = {
      ...card,
      type: 'community',
      author_name: userName,
      author_avatar: userAvatar,
      user_name: userName
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
              // Get current user info for author display
              const userEmail = localStorage.getItem('userEmail') || 'User';
              const userAvatar = localStorage.getItem('userAvatar') || '';
              let userName = localStorage.getItem('userName');
              
              // Fallback: try to get name from DOM if not in localStorage
              if (!userName) {
                const userMenuName = document.getElementById('user-menu-name');
                if (userMenuName && userMenuName.textContent) {
                  userName = userMenuName.textContent;
                  localStorage.setItem('userName', userName);
                } else {
                  userName = userEmail.split('@')[0] || 'User';
                }
              }
              
              const publicCard = {
                ...cardToUpdate,
                type: 'community',
                published_at: Date.now(),
                author_name: userName,
                author_avatar: userAvatar,
                user_name: userName
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
       if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`);
       }
       return response.json();
     })
     .then(data => {
       if (!data.path) {
         throw new Error('No image path returned from server');
       }
       const imagePath = data.path;
       return imagePath;
     })
      .catch(error => {
        console.error('Upload error:', error);
        throw error; // Re-throw to be caught by the calling function
      });
};

  function getGradientForCategory(category) {
    const gradients = {
      'DAILY THINGS': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/687245da801bfd9b1f426970_daily-gradient.svg',
      'PLACES': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/687223f28a440e377b116948_places-gradient.svg',
      'LOCAL CONTEXT': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/687245cfc59498b19f5f84d4_context-gradient.svg',
      // Fallback for different formats
      'DAILY': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/687245da801bfd9b1f426970_daily-gradient.svg',
      'CONTEXT': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/687245cfc59498b19f5f84d4_context-gradient.svg'
    };
    const gradientUrl = gradients[category] || gradients['PLACES'];
    console.log(`🎨 Gradient for category "${category}": ${gradientUrl}`);
    return gradientUrl;
  }

  function renderCardList(filter = 'all', categoryFilter = 'all') {
    // Use requestAnimationFrame for smoother transitions
    requestAnimationFrame(() => {
      cardList.style.opacity = '0.7';
      cardList.style.transform = 'scale(0.98)';
      cardList.style.transition = 'all 0.15s ease';

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
             onerror="this.src='https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4324573885a3a9d06e6e9_add-photo-ot.avif'; this.className='add-photo-icon'; this.style.display='block'; this.nextElementSibling.style.display='none';">
        <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4324573885a3a9d06e6e9_add-photo-ot.avif"
             alt="Add photo"
             class="add-photo-icon"
             style="display: ${isDefaultImage ? 'block' : 'none'}"
             data-card-id="${card.id}">
        <input type="file" accept="image/*,.heic,.heif" data-card-id="${card.id}">
        <div class="image-upload-loader" data-card-id="${card.id}">
          <div class="spinner"></div>
          <div class="loading-text"></div>
        </div>
      </div>`;
        } else if (card.type === 'completed') {
          // For completed cards, show static image with gradient background
          const gradientUrl = getGradientForCategory(card.category);
          imageHtml = `
      <div class="card-image-placeholder">
        <div class="card-gradient-background" style="background-image: url('${gradientUrl}');"></div>
        <img src="${card.imageSrc}" alt="Card image" class="uploaded-image" style="display: block;" data-card-id="${card.id}"
             onerror="this.src='https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4324573885a3a9d06e6e9_add-photo-ot.avif'">
      </div>`;
        } else {
          // For community cards, show static image with gradient background
          const gradientUrl = getGradientForCategory(card.category);
          imageHtml = `
      <div class="card-image-placeholder">
        <div class="card-gradient-background" style="background-image: url('${gradientUrl}');"></div>
        <img src="${card.imageSrc}" alt="Card image" class="uploaded-image" style="display: block;" data-card-id="${card.id}"
             onerror="this.src='https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4324573885a3a9d06e6e9_add-photo-ot.avif'">
      </div>`;
        }

        // Add more menu for saved and completed cards
        let moreMenuHtml = '';
        if (card.type === 'saved' || card.type === 'completed') {
          moreMenuHtml = `
        <div class="card-more-menu">
          <button class="card-more-btn" data-card-id="${card.id}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="2" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
              <circle cx="14" cy="8" r="1.5" fill="currentColor"/>
            </svg>
          </button>
          <div class="card-dropdown-menu" id="dropdown-${card.id}">
            <div class="card-dropdown-item" data-action="share" data-card-id="${card.id}">
              <img src="https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ca8ce2c3104eb546fd2396_ot-share-icon.svg" alt="Share" width="16" height="16">
              Share this Thing
            </div>
            <div class="card-dropdown-item delete" data-action="delete" data-card-id="${card.id}">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 4H14M5.33333 4V2.66667C5.33333 2.31305 5.47381 1.97391 5.72386 1.72386C5.97391 1.47381 6.31305 1.33333 6.66667 1.33333H9.33333C9.68696 1.33333 10.0261 1.47381 10.2761 1.72386C10.5262 1.97391 10.6667 2.31305 10.6667 2.66667V4M12.6667 4V13.3333C12.6667 13.687 12.5262 14.0261 12.2761 14.2761C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66667C4.31305 14.6667 3.97391 14.5262 3.72386 14.2761C3.47381 14.0261 3.33333 13.687 3.33333 13.3333V4H12.6667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6.66667 7.33333V11.3333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9.33333 7.33333V11.3333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Delete this Thing
            </div>
          </div>
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
      ${moreMenuHtml}
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
              // Check file size (max 10MB)
              const maxSize = 10 * 1024 * 1024; // 10MB in bytes
              if (file.size > maxSize) {
                alert('File size is too large. Please choose an image smaller than 10MB.');
                e.target.value = ''; // Clear the input
                return;
              }

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
                   console.error("❌ Ошибка загрузки:", error);
                   alert('Failed to upload image. Please try again with a different image.');
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

              if (isHeic) {
                // Check if heic2any is available
                if (typeof heic2any !== 'undefined' && heic2any) {
                  console.log('Converting HEIC file to JPEG...');
                  
                  // Convert HEIC to JPEG
                  heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                  }).then(convertedBlob => {
                    console.log('HEIC converted successfully');
                    processImage(convertedBlob);
                  }).catch(error => {
                    console.error('HEIC conversion error:', error);
                    if (loader) {
                      loader.classList.remove('show');
                    }
                    showHeicErrorTooltip();
                  });
                } else {
                  console.error('HEIC2Any library not loaded or not available');
                  console.log('Available globals:', Object.keys(window).filter(key => key.includes('heic')));
                  if (loader) {
                    loader.classList.remove('show');
                  }
                  alert('HEIC conversion library not available. Please try with a JPEG or PNG image, or refresh the page and try again.');
                }
              } else {
                // Process regular image file
                console.log('Processing regular image file...');
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

        // Add image click functionality for completed and community cards
        if (card.type === 'completed' || card.type === 'community') {
          const uploadedImage = cardEl.querySelector('.uploaded-image');
          if (uploadedImage && uploadedImage.src && !uploadedImage.src.includes('add-photo-ot.avif')) {
            uploadedImage.style.cursor = 'pointer';
            uploadedImage.addEventListener('click', () => {
              if (window.openImagePopup) {
                window.openImagePopup(uploadedImage.src);
              }
            });
          }
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

        // Add more menu functionality for saved and completed cards
        if (card.type === 'saved' || card.type === 'completed') {
          const moreBtn = cardEl.querySelector('.card-more-btn');
          const dropdown = cardEl.querySelector('.card-dropdown-menu');
          
          if (moreBtn && dropdown) {
            // Toggle dropdown on button click
            moreBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              
              // Close all other dropdowns
              document.querySelectorAll('.card-dropdown-menu.show').forEach(menu => {
                if (menu !== dropdown) {
                  menu.classList.remove('show');
                }
              });
              
              // Toggle current dropdown
              dropdown.classList.toggle('show');
            });
            
            // Handle dropdown item clicks
            const shareItem = dropdown.querySelector('[data-action="share"]');
            const deleteItem = dropdown.querySelector('[data-action="delete"]');
            
            if (shareItem) {
              shareItem.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.remove('show');
                shareCard(card);
              });
            }
            
            if (deleteItem) {
              deleteItem.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.remove('show');
                deleteCard(card);
              });
            }
          }
        }

        cardList.appendChild(cardEl);
      });

        // Add fade in effect
        requestAnimationFrame(() => {
          cardList.style.opacity = '1';
          cardList.style.transform = 'scale(1)';
        });
      }, 50);
    });
    
    // Close all dropdown menus when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.card-more-menu')) {
        document.querySelectorAll('.card-dropdown-menu.show').forEach(menu => {
          menu.classList.remove('show');
        });
      }
    });
  }

  // Share card function
  function shareCard(card) {
    const shareData = {
      title: card.title,
      text: card.description,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData)
        .then(() => {
          console.log('Card shared successfully');
        })
        .catch((error) => {
          console.error('Error sharing card:', error);
          // Fallback to copying to clipboard
          copyCardToClipboard(card);
        });
    } else {
      // Fallback to copying to clipboard
      copyCardToClipboard(card);
    }
  }

  // Copy card to clipboard function
  function copyCardToClipboard(card) {
    const shareText = `${card.title}\n\n${card.description}\n\nCheck it out on Globio One Thing!`;
    
    navigator.clipboard.writeText(shareText)
      .then(() => {
        // Show success tooltip
        showShareSuccessTooltip();
      })
      .catch((error) => {
        console.error('Failed to copy to clipboard:', error);
        showCopyErrorTooltip();
      });
  }

  // Delete card function
  function deleteCard(card) {
    // Show confirmation popup
    showDeleteConfirmationPopup(card);
  }

  // Show delete confirmation popup
  function showDeleteConfirmationPopup(card) {
    const popup = document.getElementById('confirmation-popup');
    const titleEl = document.getElementById('confirmation-title');
    const descriptionEl = document.getElementById('confirmation-description');
    const confirmBtn = document.getElementById('confirmation-confirm');

    if (titleEl) titleEl.textContent = 'Delete this Thing?';
    if (descriptionEl) descriptionEl.textContent = 'This action cannot be undone. The card will be permanently removed from your saved and completed items.';
    if (confirmBtn) confirmBtn.textContent = 'Delete Thing';

    // Store the card ID and action for confirmation
    popup.dataset.cardId = card.one_thing_user_card_id;
    popup.dataset.action = 'delete';

    popup.classList.add('show');
    preventBodyScroll();
  }

  // Show share success tooltip
  function showShareSuccessTooltip() {
    const tooltip = document.getElementById('saved-success-tooltip');
    if (tooltip) {
      tooltip.querySelector('span').textContent = 'Card shared successfully!';
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
        tooltip.querySelector('span').textContent = 'Thing Saved!';
      }, 3000);
    }
  }

  // Delete card from server
  function deleteCardFromServer(cardId) {
    const deleteUrl = `https://xu8w-at8q-hywg.n7d.xano.io/api:WT6s5fz4/one_thing_users_cards/${cardId}`;
    
    fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to delete card: ${response.status} ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      // Remove card from local arrays using one_thing_user_card_id
      savedCards = savedCards.filter(card => card.one_thing_user_card_id != cardId);
      completedCards = completedCards.filter(card => card.one_thing_user_card_id != cardId);
      publicCards = publicCards.filter(card => card.one_thing_user_card_id != cardId);
      
      // Update UI without reloading page
      renderCardList(currentTypeFilter, currentCategoryFilter);
      
      // Show success tooltip
      showDeleteSuccessTooltip();
    })
    .catch(error => {
      console.error('Error deleting card:', error);
      showDeleteErrorTooltip();
    });
  }

  // Show delete success tooltip
  function showDeleteSuccessTooltip() {
    const tooltip = document.getElementById('saved-success-tooltip');
    if (tooltip) {
      tooltip.querySelector('span').textContent = 'Thing deleted successfully!';
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
        tooltip.querySelector('span').textContent = 'Thing Saved!';
      }, 3000);
    }
  }

  // Show delete error tooltip
  function showDeleteErrorTooltip() {
    const tooltip = document.getElementById('copy-error-tooltip');
    if (tooltip) {
      tooltip.querySelector('span').textContent = 'Failed to delete thing. Please try again.';
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
        tooltip.querySelector('span').textContent = 'Failed to copy link. Please copy manually.';
      }, 3000);
    }
  }

  // Show copy error tooltip
  function showCopyErrorTooltip() {
    const tooltip = document.getElementById('copy-error-tooltip');
    if (tooltip) {
      tooltip.querySelector('span').textContent = 'Failed to copy to clipboard. Please copy manually.';
      tooltip.classList.add('show');

      setTimeout(() => {
        tooltip.classList.remove('show');
        tooltip.querySelector('span').textContent = 'Failed to copy link. Please copy manually.';
      }, 3000);
    }
  }

  // Show "How One Things Work" popup
  function showHowOneThingsWorkPopup() {
    console.log('showHowOneThingsWorkPopup called');
    const popup = document.getElementById('how-one-things-work-popup');
    console.log('Popup element found:', popup);
    if (popup) {
      console.log('Adding show class to popup');
      popup.classList.add('show');
      preventBodyScroll();
      console.log('Popup should be visible now');
    } else {
      console.error('Popup element not found!');
    }
  }

  // Hide "How One Things Work" popup
  function hideHowOneThingsWorkPopup() {
    console.log('hideHowOneThingsWorkPopup called');
    const popup = document.getElementById('how-one-things-work-popup');
    console.log('Popup element found:', popup);
    if (popup) {
      console.log('Removing show class from popup');
      popup.classList.remove('show');
      restoreBodyScroll();
      console.log('Popup should be hidden now');
    } else {
      console.error('Popup element not found!');
    }
  }

  // Initialize "How One Things Work" popup
  function initializeHowOneThingsWorkPopup() {
    const popup = document.getElementById('how-one-things-work-popup');
    const closeBtn = document.getElementById('close-how-one-things-work-modal');
    const gotItBtn = document.getElementById('got-it-btn');

    console.log('Initializing How One Things Work popup...');
    console.log('Popup element:', popup);
    console.log('Close button:', closeBtn);
    console.log('Got it button:', gotItBtn);

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        console.log('Close button clicked');
        e.preventDefault();
        e.stopPropagation();
        hideHowOneThingsWorkPopup();
      });
    }

    if (gotItBtn) {
      gotItBtn.addEventListener('click', (e) => {
        console.log('Got it button clicked');
        e.preventDefault();
        e.stopPropagation();
        hideHowOneThingsWorkPopup();
      });
    }

    if (popup) {
      popup.addEventListener('click', (e) => {
        console.log('Popup clicked, target:', e.target);
        if (e.target === popup) {
          console.log('Clicking outside popup, closing...');
          hideHowOneThingsWorkPopup();
        }
      });
    }
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
//              imageSrc: "https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4324573885a3a9d06e6e9_add-photo-ot.avif", // заглушка
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

    let cityId = localStorage.getItem('userCityId');

    fetch(API_USER_CARDS_TEST + '?user_id=' + userId + '&city_id=' + cityId)
      .then(response => {
        return response.json();
      })
      .then(data => {
        if (data) {

       var usersCards = data
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

//       var usersCards = data
//             .filter(item => item.created_at !== null)
//             .map(item => ({
//               ...item.card,
//               expired_at: item.expired_at,
//               one_thing_user_card_id: item.id,
//               completed: item.completed,
//               published: item.published,
//               image: item.image,
//               created_at: item.created_at
//             }))
//             .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

          var formattedCards = usersCards
            .filter(card => !card.completed) // Only show non-completed cards in saved
            .map(card => ({
              id: card.id,
              title: card.title,
              description: card.description,
              category: card.tags.split(",")[0]?.toUpperCase() || "LOCAL CONTEXT",
              imageSrc: card.image ? "https://xu8w-at8q-hywg.n7d.xano.io" + card.image : "https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68c4324573885a3a9d06e6e9_add-photo-ot.avif",
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

        let cityId = localStorage.getItem('userCityId');

        fetch(API_USER_CARDS_TEST + '?user_id=' + userId + '&city_id=' + cityId)
          .then(response => {
            return response.json();
          })
          .then(data => {
            if (data) {
              var usersCards = data
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

        let cityId = localStorage.getItem('userCityId');

        // Get all published cards from all users
        fetch(API_USER_CARDS_TEST + '?city_id=' + cityId)
          .then(response => {
            return response.json();
          })
          .then(data => {
              // Filter only published cards from all users
              var publishedCards = data
                .filter(item => item.published === true && item.completed === true)
                .map(item => ({
                  ...item.card,
                  expiredAt: item.expired_at,
                  one_thing_user_card_id: item.id,
                  completed: item.completed,
                  published: item.published,
                  imageSrc: "https://xu8w-at8q-hywg.n7d.xano.io" + item.image,
                  completed_at: item.completed_at,
                  author_name: item.user.name,
                  author_avatar: item.user.picture,
                  type: "community"
                }))
                .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
                publicCards = publishedCards;
          })
          .catch(error => {
          });
      }


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
