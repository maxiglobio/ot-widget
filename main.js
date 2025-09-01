  (function () {
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

    const savedButton = document.querySelector('button[data-filter="saved"]');
    const completedButton = document.querySelector('button[data-filter="completed"]');
    const communityButton = document.querySelector('button[data-filter="community"]');

    var uploadFileName = '';


    // Function to ensure userId is set in localStorage
    function ensureUserId() {
      let userId = localStorage.getItem('userId');
      userId = 266;

      if (!userId) {
        // Try to get from auth object
        const auth = localStorage.getItem('auth');
        if (auth) {
          try {
            const authObj = JSON.parse(auth);
            if (authObj.id) {
              userId = authObj.id;
              localStorage.setItem('userId', userId);
              console.log('✅ Set userId from auth object:', userId);
            }
          } catch (e) {
            console.error('Error parsing auth object:', e);
          }
        }

        // If still no userId, generate a temporary one for testing
        if (!userId) {
          userId = 'temp-user-' + Date.now();
          localStorage.setItem('userId', userId);
          console.log('⚠️ Generated temporary userId for testing:', userId);
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

    // Ensure userId is set
    ensureUserId();

    updateCounterUI();

    // Restore active state for filter buttons
    filterButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-filter') === currentTypeFilter) {
        btn.classList.add('active');
      }
    });

    renderCardList(currentTypeFilter, currentCategoryFilter); // Start with saved cards by default

    loadSavedUserCards();

    // Initialize dropdown functionality
    initializeDropdown();

    // Initialize event listeners when DOM is ready
    function initializeEventListeners() {
      // Initialize the UI
      updateCounterUI();

      // Restore active state for filter buttons
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === currentTypeFilter) {
          btn.classList.add('active');
        }
      });

      renderCardList(currentTypeFilter, currentCategoryFilter);

      // Confirmation popup handlers
      const cancelBtn = document.getElementById('confirmation-cancel');
      const confirmBtn = document.getElementById('confirmation-confirm');

      if (cancelBtn) {
        cancelBtn.addEventListener('click', hideConfirmationPopup);
      } else {
        console.error('Confirmation cancel button not found');
      }

      if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
          const popup = document.getElementById('confirmation-popup');
          const cardId = popup.dataset.cardId;
          const action = popup.dataset.action;

          console.log('Confirmation button clicked:', action, 'for card:', cardId);

          if (cardId && action) {

            if (action === 'make-public') {
              makeCardPublic(cardId);
            } else if (action === 'make-private') {
              makeCardPrivate(cardId);
            }
            hideConfirmationPopup();
          } else {
            console.error('Missing cardId or action:', { cardId, action });
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

          console.log('API response debug:', data);

          currentSuggestion = {
            id: data.id || data.card_id || data.cardId || data.card?.id || data.item?.id || data.thing?.id || data.name || 'generated-' + Date.now(),
            title: data.title || data.name || 'No Tip This Time',
            description: data.description || 'Sometimes even the best advice needs a rest. Come back later.',
            category: data.category || data.card?.category || data.item?.category || data.thing?.category || 'places'
          };

          console.log('Current suggestion debug:', currentSuggestion);

          showPopup(currentSuggestion);
        })
        .catch(err => {
          btn.classList.remove('loading');
          stopLoadingAnimation();
          console.error(err);
        });
    });

    btnSave.addEventListener('click', () => {
      if (!currentSuggestion) return;
      const userId = ensureUserId();
      console.log('currentSuggestion', currentSuggestion);

      if (userId && currentSuggestion.id) {
        fetch(API_SAVE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ one_thing_users_id: userId, one_thing_cards_id: currentSuggestion.id, expired_at: Date.now() + 1000 * 60 * 60 * 24 * 30 })
        }).catch(err => console.error(err));
      }
      // Add expiry timestamp with default image
      savedCards.unshift({
        ...currentSuggestion,
        imageSrc: 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif',
        expiresAt: Date.now() + EXPIRY_MS
      });

      loadSavedUserCards();

      decrementAttempts();

      // Switch to Saved tab and update UI
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

      // Switch to Completed tab and update UI
      filterButtons.forEach(b => b.classList.remove('active'));
      const completedButton = document.querySelector('button[data-filter="completed"]');
      if (completedButton) {
        completedButton.classList.add('active');
      }

      renderCardList('completed', currentCategoryFilter);
      hidePopup();
    });

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
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

      console.log('Popup category debug:', {
        originalCategory: card.category,
        finalCategory: category,
        categoryText: categoryText,
        pillClass: 'popup-category-pill ' + category
      });

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
        'LOCAL CONTEXT': 'Local Context'
      };
      return categories[category] || 'Places';
    }

    function getCategoryIcon(category) {
      const icons = {
        'places': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6826448f03113f68969d46cd_f5b48ffdd38299fb12160bbb19947d4e_places-w-icon.avif',
        'daily': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6826448ecfee5d81a38cfe2b_2d10e4120ba1f04e841d77b0ac0343f1_daily-things-w-icon.avif',
        'local': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6826448ed894827a2b78fa6f_cb98b2f22368b7cf361ebfcac726e4a_local-context-w-icon.avif',
        'DAILY THINGS': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6826448ecfee5d81a38cfe2b_2d10e4120ba1f04e841d77b0ac0343f1_daily-things-w-icon.avif',
        'PLACES': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6826448f03113f68969d46cd_f5b48ffdd38299fb12160bbb19947d4e_places-w-icon.avif',
        'LOCAL CONTEXT': 'https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/6826448ed894827a2b78fa6f_cb98b2f22368b7cf361ebfcac726e4a_local-context-w-icon.avif'
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
      "Gathering one thing…",
      "Asking locals for secrets…",
      "Digging for hidden gems…",
      "Searching cozy nooks…",
      "Extracting calm in chaos…",
      "Sneaking past tourist traps…"
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
        console.log('Success tooltip shown');

        setTimeout(() => {
          tooltip.classList.remove('show');
          console.log('Success tooltip hidden');
        }, 3000);
      } else {
        console.error('Success tooltip element not found');
      }
    }

    function showConfirmationPopup(one_thing_user_card_id, action) {
//      console.log('showConfirmationPopup called:', cardId, action);

      const card = savedCards.find(c => c.one_thing_user_card_id === one_thing_user_card_id);
      if (!card) {
        console.log('Card not found in savedCards:', one_thing_user_card_id);
        return;
      }

      const titleEl = document.getElementById('confirmation-title');
      const descriptionEl = document.getElementById('confirmation-description');
      const confirmBtn = document.getElementById('confirmation-confirm');

      console.log('Found elements:', { titleEl: !!titleEl, descriptionEl: !!descriptionEl, confirmBtn: !!confirmBtn });

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
        console.log('Popup shown with data:', { one_thing_user_card_id, action });
        console.log('Popup dataset after setting:', popup.dataset);
      } else {
        console.error('Confirmation popup element not found');
      }
    }

    function hideConfirmationPopup() {
      document.getElementById('confirmation-popup').classList.remove('show');
      delete document.getElementById('confirmation-popup').dataset.cardId;
      delete document.getElementById('confirmation-popup').dataset.action;
    }

    // Global functions for empty state buttons
    function scrollToGetOneThing() {
      const oneThingBtn = document.getElementById('one-thing-btn');
      if (oneThingBtn) {
        oneThingBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
        console.error('Failed to copy: ', err);
        alert('Failed to copy link. Please copy manually.');
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
        console.error('Failed to copy: ', err);
        alert('Failed to copy link. Please copy manually.');
      });
    }

    function makeCardPublic(cardId) {
      cardId = parseInt(cardId);
      const card = savedCards.find(c => c.one_thing_user_card_id == cardId);
      if (!card) {
        console.error('Error makeCardPublic');
        return;
      }
      const userId = ensureUserId();
      const requestBody = {
        one_thing_user_card_id: cardId,
        published: true,
        completed: true
      };
      makeApiCall(requestBody, card);
    }

     function makeCardCompleted(one_thing_user_card_id) {
        const userId = ensureUserId();


        console.log('one_thing_user_card_id', one_thing_user_card_id);
        console.log('savedCards', savedCards);
        const card = savedCards.find(c => c.one_thing_user_card_id == one_thing_user_card_id);
        if (!card) {
            console.log('Error makeCardCompleted');
            return;
        }
        const requestBody = {
            one_thing_user_card_id: one_thing_user_card_id,
            completed: true,
            published: false
        };
        makeApiCall(requestBody, card);
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
            console.error('❌ API response not ok:');
            throw new Error(`Failed to make card public: ${response.status} ${response.statusText}`);
          }
          return response.json();
        })
        .then(data => {
          // Add to public cards if not already there
          const cardId = requestBody.one_thing_cards_id;

          renderCardList(currentTypeFilter, currentCategoryFilter);

          // Re-enable toggle and update its state
          const toggle = document.querySelector(`#toggle-${cardId}`);
          if (toggle) {
            toggle.disabled = false;
            toggle.checked = true; // Ensure toggle shows as checked
            console.log('✅ Updated toggle state for card:', cardId);
          } else {
            console.log('⚠️ Toggle not found for card:', cardId);
          }

          // Show success tooltip
          showSuccessTooltip();
          console.log('🎉 Successfully made card public!');
        })
        .catch(error => {
          console.error('❌ Error making card public:', error);
          console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });

          const cardId = requestBody.one_thing_cards_id;

          // Re-enable toggle on error
          const toggle = document.querySelector(`#toggle-${cardId}`);
          if (toggle) {
            toggle.disabled = false;
            toggle.checked = false; // Reset to private state
            console.log('🔄 Reset toggle to private state due to error');
          }
        });
    }

    function makeCardPrivate(cardId) {
        cardId = parseInt(cardId);
        const card = savedCards.find(c => c.one_thing_user_card_id == cardId);
        if (!card) {
          console.error('Error makeCardPrivate');
          return;
        }
        const userId = ensureUserId();
        const requestBody = {
          one_thing_user_card_id: cardId,
          published: false,
          completed: true
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
          console.error('❌ Error making card public:', error);
        });
  };

    function renderCardList(filter = 'all', categoryFilter = 'all') {
      // Add fade out effect
      cardList.style.opacity = '0.7';
      cardList.style.transform = 'scale(0.98)';
      cardList.style.transition = 'all 0.2s ease';

      setTimeout(() => {
        cardList.innerHTML = '';
        // Remove expired saved cards
        const now = Date.now();
        savedCards = savedCards.filter(card => card.expiresAt > now);

        let toShow = [];

        // Filter by type (saved/completed/community)
        if (filter === 'saved' || filter === 'all') {
//          toShow = toShow.concat(savedCards.map(c => ({ ...c, type: 'saved111' })));
          toShow = savedCards;
        }
        if (filter === 'completed' || filter === 'all') {
//          toShow = toShow.concat(savedCards.map(c => ({ ...c, type: 'completed2222' })));
          toShow = savedCards;
        }
        if (filter === 'community' || filter === 'all') {
//          toShow = toShow.concat(publicCards.map(c => ({ ...c, type: 'community' })));
          toShow = savedCards;
        }



        console.log('to show', toShow);

        // Filter by category
        if (categoryFilter !== 'all') {
          toShow = toShow.filter(card => card.category === categoryFilter);
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
            expiryHtml = `<div class="card-expiry">${daysLeft} day${daysLeft === 1 ? '' : 's'} left</div>`;
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
              actionHtml = `<div class="card-expiry">${daysLeft} days left</div>`;
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

          // Add author name for community cards
          let authorHtml = '';
          if (card.type === 'community') {
            const authorName = card.author_name || card.user_name || 'Anonymous';
            authorHtml = `<div class="card-author">by ${authorName}</div>`;
          }

          // Create different HTML for saved vs completed cards
          let imageHtml = '';
          if (card.type === 'saved') {
            // For saved cards, show interactive image upload
            imageHtml = `
        <div class="card-image-placeholder">
          <img src="${card.imageSrc}" alt="Card image" class="${isDefaultImage ? 'add-photo-icon' : 'uploaded-image'}" style="display: ${isDefaultImage ? 'none' : 'block'}" data-card-id="${card.id}">
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
          <img src="${card.imageSrc}" alt="Card image" class="uploaded-image" style="display: block;" data-card-id="${card.id}">
        </div>`;
          } else {
            // For community cards, show static image
            imageHtml = `
        <div class="card-image-placeholder">
          <img src="${card.imageSrc}" alt="Card image" class="uploaded-image" style="display: block;" data-card-id="${card.id}">
        </div>`;
          }

          cardEl.innerHTML = `
        <div class="card-category-tag ${card.category}">${categoryText}</div>
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

            console.log('Setting up image upload for card:', card.id, 'elements found:', {
              img: !!img,
              addPhotoIcon: !!addPhotoIcon,
              input: !!input
            });

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
                     console.log("✅ Всё прошло успешно", response);
                   })
                   .catch(function(error) {
                     console.error("❌ Ошибка:", error);
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
                    console.log('File processed for card:', card.id);

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
                          console.log('Updating saved card image:', card.id);
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
                          console.error('Saved card not found:', card.id);
                        }
                      }
                    }, remainingTime);
                  };

                  reader.onerror = () => {
                    console.error('Error reading file for card:', card.id);
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
                  console.log('Converting HEIC file to JPEG for card:', card.id);

                  // Convert HEIC to JPEG
                  heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.8
                  }).then(convertedBlob => {
                    console.log('HEIC converted successfully for card:', card.id);
                    processImage(convertedBlob);
                  }).catch(error => {
                    console.error('Error converting HEIC file for card:', card.id, error);
                    if (loader) {
                      loader.classList.remove('show');
                    }
                    alert('Error converting HEIC image. Please try a different image format.');
                  });
                } else {
                  // Process regular image file
                  console.log('Processing regular image file for card:', card.id);
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
                // Move card from saved to completed
//                const savedIndex = savedCards.findIndex(c => c.id === card.id);
//                if (savedIndex !== -1) {
//                  // Remove from saved cards
//                  savedCards.splice(savedIndex, 1);



                  console.log('complete-thing-btn');

                  makeCardCompleted(card.one_thing_user_card_id);






                  // Show success tooltip
                  showSuccessTooltip();

                  // Re-render both lists
                  renderCardList(currentTypeFilter, currentCategoryFilter);
//                }
              }
            });
          }

          // Add toggle switch functionality for completed cards
          if (card.type === 'completed') {

            console.log('ccccc');
            const toggle = cardEl.querySelector('input[type="checkbox"]');
            if (toggle) {

              toggle.addEventListener('change', (e) => {


                // Disable toggle during API call
                toggle.disabled = true;

                if (e.target.checked && !card.published) {
                  // Making public
                  console.log('Showing make-public confirmation for card:', card.id);
                  showConfirmationPopup(card.one_thing_user_card_id, 'make-public');
                } else if (!e.target.checked && card.published) {
                  // Making private
                  console.log('Showing make-private confirmation for card:', card.id);
                  showConfirmationPopup(card.one_thing_user_card_id, 'make-private');
                } else {
                  console.log('No action needed - toggle state matches public state');
                }

                // Reset the toggle to current state until confirmed with smooth animation
                setTimeout(() => {
                  e.target.checked = card.published;
                  toggle.disabled = false;
                  console.log('Reset toggle for card:', card.id, 'to:', card.published);
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
    setInterval(() => {
      renderCardList(currentTypeFilter, currentCategoryFilter);
    }, 60 * 60 * 1000);
    // Keep attempts counter updated every minute
    setInterval(() => { if (attemptsLeft <= 0) updateCounterUI(); }, 60000);



//    function loadCards() {
//      if (!currentSuggestion) return;
//      const userId = ensureUserId();
//      if (userId && currentSuggestion.id) {
//        let user = fetch(API_USERS + '/' + userId, {
//          method: 'GET',
//          headers: { 'Content-Type': 'application/json' },
//        }).catch(err => console.error(err));
//      }
//    }



//    // Load public cards from API on initialization
//    function loadUserCards() {
//
//      const userId = ensureUserId();
//      if (!userId) {
//        console.log('No userId found for loadUserCards');
//        return;
//      }
//
//      fetch(API_USERS + '/' + userId)
//        .then(response => {
//          console.log('loadUserCards response status:', response.status);
//          return response.json();
//        })
//        .then(data => {
//          if (data) {
//            const usersCards = data.users_cards.map(item => item.card);
//
//
//
//            console.log('usersCards', usersCards);
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
//          console.error('Error loading public cards:', error);
//        });
//    }



    function loadSavedUserCards() {
      const userId = ensureUserId();
      if (!userId) {
        console.log('No userId');
        return;
      }

      fetch(API_USERS + '/' + userId)
        .then(response => {
          console.log('loadUserCards response status:', response.status);
          return response.json();
        })
        .then(data => {
          if (data) {
            var usersCards = data.users_cards
              .filter(item => item.completed === false)
              .map(item => ({
                ...item.card,
                expired_at: item.expired_at,
                one_thing_user_card_id: item.id,
                completed: item.completed,
                published: item.published
              }));

            var formattedCards = usersCards.map(card => ({
              id: card.id,
              title: card.name,
              description: `Discover the ${card.name} in ${card.city}. A great spot for ${card.tags.split(",").join(", ")}.`,
              category: card.tags.split(",")[0]?.toUpperCase() || "LOCAL CONTEXT",
              imageSrc: "https://cdn.prod.website-files.com/64d15b8bef1b2f28f40b4f1e/68ad7aea3e7e2dcd1b6e8350_add-photo.avif",
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
          console.error('Error loading public cards:', error);
        });
    }


     function loadCompletedUserCards() {
          const userId = ensureUserId();
          if (!userId) {
            console.log('No userId');
            return;
          }

          fetch(API_USERS + '/' + userId)
            .then(response => {
              return response.json();
            })
            .then(data => {
              if (data) {
                var usersCards = data.users_cards
                  .filter(item => item.completed === true) // фильтр по completed
                  .map(item => ({
                      ...item.card,
                      expired_at: item.expired_at,
                      one_thing_user_card_id: item.id,
                      completed: item.completed,
                      published: item.published,
                      imageSrc: item.image
                    }));

                var formattedCards = usersCards.map(card => ({
                  id: card.id,
                  title: card.name,
                  description: `Discover the ${card.name} in ${card.city}. A great spot for ${card.tags.split(",").join(", ")}.`,
                  category: card.tags.split(",")[0]?.toUpperCase() || "LOCAL CONTEXT",
                  imageSrc: "https://xu8w-at8q-hywg.n7d.xano.io" + card.imageSrc,
                  expiresAt: card.expired_at,
                  one_thing_user_card_id: card.one_thing_user_card_id,
                  completed: card.completed,
                  published: card.published,
                  type: "completed"
                }));
                savedCards = formattedCards;
                renderCardList('completed', currentCategoryFilter);
              }
            })
            .catch(error => {
              console.error('Error loading public cards:', error);
            });
    }

     function loadCommunityUserCards() {

          const userId = ensureUserId();
          if (!userId) {
            console.log('No userId');
            return;
          }

          fetch(API_USERS + '/' + userId)
            .then(response => {
              return response.json();
            })
            .then(data => {
              if (data) {
                var usersCards = data.users_cards
                  .filter(item => item.published === true)
                  .map(item => ({
                    ...item.card,
                    expired_at: item.expired_at,
                    one_thing_user_card_id: item.id,
                    completed: item.completed,
                      published: item.published,
                      imageSrc: item.image
                  }));

                var formattedCards = usersCards.map(card => ({
                  id: card.id,
                    title: card.name,
                    description: `Discover the ${card.name} in ${card.city}. A great spot for ${card.tags.split(",").join(", ")}.`,
                    category: card.tags.split(",")[0]?.toUpperCase() || "LOCAL CONTEXT",
                    imageSrc: "https://xu8w-at8q-hywg.n7d.xano.io" + card.imageSrc,
                    expiresAt: card.expired_at,
                    one_thing_user_card_id: card.one_thing_user_card_id,
                    completed: card.completed,
                    published: card.published,
                  type: "community"
                }));
                savedCards = formattedCards;
                renderCardList('community', currentCategoryFilter);
              }
            })
            .catch(error => {
              console.error('Error loading public cards:', error);
            });
        }




    completedButton.addEventListener('click', () => {
        loadCompletedUserCards();
    });


    savedButton.addEventListener('click', () => {
        loadSavedUserCards();
    });

    communityButton.addEventListener('click', () => {
        loadCommunityUserCards();
    });






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
        console.log('Dropdown clicked, current state:', {
          isActive: dropdownTrigger.classList.contains('active'),
          isShow: dropdownMenu.classList.contains('show')
        });

        dropdownTrigger.classList.toggle('active');
        dropdownMenu.classList.toggle('show');

        // Ensure dropdown trigger stays active
        if (!dropdownMenu.classList.contains('show')) {
          dropdownTrigger.classList.add('active');
        }

        console.log('Dropdown state after toggle:', {
          isActive: dropdownTrigger.classList.contains('active'),
          isShow: dropdownMenu.classList.contains('show')
        });
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