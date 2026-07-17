(() => {
      const body = document.body;
      const phone = document.querySelector('.phone');
      const chatView = document.querySelector('[data-screen-view="chat"]');
      const profileView = document.querySelector('[data-screen-view="profile"]');
      const chatProductScreen = document.querySelector('.chat-product-screen');
      const profileProductScreen = document.querySelector('.profile-product-screen');
      const chatAssetFallback = document.querySelector('.chat-asset-fallback');
      const profileAssetFallback = document.querySelector('.profile-asset-fallback');
      const profileCallButton = document.querySelector('[data-profile-call-entry]');
      const profileVideoBadge = document.querySelector('[data-profile-video-badge]');
      const input = document.querySelector('.message-input');
      const toast = document.querySelector('.toast');
      const send = document.querySelector('.send-button');
      const toolButtons = document.querySelectorAll('[data-tool]');
      const switchButton = document.querySelector('.switch');
      const detail = document.querySelector('.annotation-detail');
      const notes = document.querySelector('.notes');
      const saveNote = document.querySelector('.save-note');
      const stateButtons = document.querySelectorAll('[data-composer-state]');
      const userTypeButtons = document.querySelectorAll('[data-user-type]');
      const accessStateButtons = document.querySelectorAll('[data-access-state]');
      const pageButtons = document.querySelectorAll('[data-preview-page]');
      const panelTitle = document.querySelector('.panel-title');
      const chatControls = document.querySelector('.chat-controls');
      const profileControls = document.querySelector('.profile-controls');
      const stateDescription = document.querySelector('.state-description');
      const scenarioPrimary = document.querySelector('.scenario-primary');
      const scenarioSecondary = document.querySelector('.scenario-secondary');
      const scenarioDetail = document.querySelector('.scenario-detail');
      const priceNote = document.querySelector('.prototype-price-note');
      const profileSourceNote = document.querySelector('.profile-source-note');
      const meta = document.querySelector('.meta');
      const callSheetLayer = document.querySelector('.chat-call-sheet-layer');
      const callSheetBackdrop = callSheetLayer.querySelector('.call-sheet-backdrop');
      const callSheetCancel = callSheetLayer.querySelector('.call-sheet-cancel');
      const callChoiceButtons = document.querySelectorAll('[data-call-choice]');
      const profileCallSheetLayer = document.querySelector('.profile-call-sheet-layer');
      const profileCallSheetBackdrop = profileCallSheetLayer.querySelector('.profile-call-sheet-backdrop');
      const profileCallSheetCancel = profileCallSheetLayer.querySelector('.profile-call-sheet-cancel');
      const profileCallChoiceButtons = profileCallSheetLayer.querySelectorAll('[data-profile-call-choice]');
      const intimacyModalLayer = document.querySelector('.intimacy-modal-layer');
      const intimacyModalBackdrop = intimacyModalLayer.querySelector('.intimacy-modal-backdrop');
      const intimacyActionButtons = intimacyModalLayer.querySelectorAll('[data-intimacy-action]');
      const primaryCallOption = callSheetLayer.querySelector('.call-option.video');
      const primaryCallTitle = primaryCallOption.querySelector('.call-option-title');
      const secondaryCallOption = callSheetLayer.querySelector('.call-option.audio');
      const secondaryCallTitle = secondaryCallOption.querySelector('.call-option-title');
      phone.append(callSheetLayer, profileCallSheetLayer, intimacyModalLayer, toast);
      const prototypeState = {
        page: 'chat',
        composerState: 'configured',
        userType: 'core',
        accessState: 'locked'
      };
      const noteStorageKeys = {
        chat: 'laka-chat-composer-notes',
        profile: 'laka-user-profile-notes'
      };
      const noteDrafts = { chat: '', profile: '' };
      let toastTimer;

      function setActiveButtons(buttons, dataKey, value) {
        buttons.forEach((button) => {
          const active = button.dataset[dataKey] === value;
          button.classList.toggle('active', active);
          button.setAttribute('aria-pressed', String(active));
        });
      }

      function closeCallSheet() {
        [callSheetLayer, profileCallSheetLayer].forEach((layer) => {
          layer.classList.remove('open');
          layer.setAttribute('aria-hidden', 'true');
          layer.setAttribute('inert', '');
        });
      }

      function closeIntimacyModal() {
        intimacyModalLayer.classList.remove('open');
        intimacyModalLayer.setAttribute('aria-hidden', 'true');
        intimacyModalLayer.setAttribute('inert', '');
      }

      function renderPrototypeState() {
        const profilePage = prototypeState.page === 'profile';
        const configured = prototypeState.composerState === 'configured';
        const unlocked = prototypeState.accessState === 'unlocked';
        const core = prototypeState.userType === 'core';

        closeCallSheet();
        closeIntimacyModal();
        chatView.hidden = profilePage;
        chatView.classList.toggle('active', !profilePage);
        chatView.setAttribute('aria-hidden', String(profilePage));
        profileView.hidden = !profilePage;
        profileView.classList.toggle('active', profilePage);
        profileView.setAttribute('aria-hidden', String(!profilePage));

        setActiveButtons(pageButtons, 'previewPage', prototypeState.page);
        chatControls.hidden = profilePage;
        profileControls.hidden = !profilePage;
        priceNote.hidden = profilePage;
        profileSourceNote.hidden = !profilePage;
        panelTitle.textContent = profilePage ? 'User Profile' : 'Chat Composer';
        phone.setAttribute(
          'aria-label',
          profilePage ? 'Laka User Profile state prototype' : 'Laka IM Chat high-fidelity prototype'
        );

        phone.classList.toggle('state-original', !configured);
        phone.classList.toggle('state-icon-moved', configured);
        phone.classList.toggle('user-core', core);
        phone.classList.toggle('user-blocked', !core);
        phone.classList.toggle('access-locked', !unlocked);
        phone.classList.toggle('access-unlocked', unlocked);

        setActiveButtons(stateButtons, 'composerState', prototypeState.composerState);
        setActiveButtons(userTypeButtons, 'userType', prototypeState.userType);
        setActiveButtons(accessStateButtons, 'accessState', prototypeState.accessState);

        const profileCallType = core ? 'Video and Audio Call' : 'Audio Call';
        const keepOriginalProfileEntry = core && !unlocked;
        profileCallButton.hidden = false;
        profileCallButton.dataset.profileCallType = profileCallType;
        profileCallButton.classList.toggle('locked', !unlocked);
        profileCallButton.classList.toggle('use-original-entry', keepOriginalProfileEntry);
        profileCallButton.setAttribute('aria-label', `${profileCallType}${unlocked ? '' : ', locked'}`);
        profileVideoBadge.hidden = !core;

        if (profilePage) {
          const userLabel = core ? 'Core woman' : 'Blocked woman';
          const accessLabel = unlocked ? 'Unlocked' : 'Locked';
          meta.textContent = `Draft v0.22 · User Profile · ${userLabel} · ${accessLabel}`;
          scenarioPrimary.textContent = 'The lower-left call entry follows user type and unlock status.';
          scenarioSecondary.textContent = unlocked
            ? (core
              ? 'Unlocked profile entry opens Invite and direct Video / Audio options.'
              : 'Unlocked profile entry opens Invite and direct Audio options.')
            : 'Locked profile entry opens the insufficient intimacy prompt.';

          if (core && !unlocked) {
            stateDescription.textContent = 'Core woman: the existing locked profile call icon remains unchanged.';
            scenarioDetail.textContent = 'Core woman · Locked: keep the current icon; video badge shows Officially verified.';
          } else if (core) {
            stateDescription.textContent = 'Core woman: the lower-left entry becomes highlighted Video + Audio Call.';
            scenarioDetail.textContent = 'Core woman · Unlocked: combined call entry plus the Officially verified video badge.';
          } else if (!unlocked) {
            stateDescription.textContent = 'Blocked woman: the lower-left entry becomes greyed Audio Call.';
            scenarioDetail.textContent = 'Blocked woman · Locked: grey Audio Call opens the intimacy prompt.';
          } else {
            stateDescription.textContent = 'Blocked woman: the lower-left entry becomes highlighted Audio Call.';
            scenarioDetail.textContent = 'Blocked woman · Unlocked: green Audio Call opens two Invite / direct Audio options.';
          }
          return;
        }

        scenarioPrimary.textContent = 'Configured is the active review state.';
        scenarioSecondary.textContent = 'Configured is controlled by user type and unlock status.';

        const originallyLocked = new Set(['Album', 'Voice', 'Audio Call', 'Video Call']);
        toolButtons.forEach((button) => {
          const locked = configured
            ? !unlocked && originallyLocked.has(button.dataset.tool)
            : originallyLocked.has(button.dataset.tool);
          button.classList.toggle('locked', locked);
          button.setAttribute('aria-label', `${button.dataset.tool}${locked ? ', locked' : ''}`);
        });

        if (!configured) {
          meta.textContent = 'Draft v0.22 · IM Chat · Configured';
          stateDescription.textContent = 'Configured preview is the active review state.';
          scenarioDetail.textContent = 'Choose a user type or unlock status to review the configured result.';
          return;
        }

        const userLabel = core ? 'Core woman' : 'Blocked woman';
        const accessLabel = unlocked ? 'Unlocked' : 'Locked';
        meta.textContent = `Draft v0.22 · ${userLabel} · ${accessLabel}`;

        if (unlocked && core) {
          stateDescription.textContent = `${userLabel}: five lower tools are highlighted and unlocked.`;
          scenarioDetail.textContent = `${userLabel} · Unlocked: five lower tools; Audio and Video open call options.`;
        } else if (unlocked) {
          stateDescription.textContent = 'Blocked woman: four lower tools are highlighted and unlocked.';
          scenarioDetail.textContent = 'Blocked woman · Unlocked: four lower tools; Audio opens call options.';
        } else if (core) {
          stateDescription.textContent = 'Core woman: locked Audio Call fills the fourth lower-toolbar slot.';
          scenarioDetail.textContent = 'Core woman · Locked: five lower tools with locked Audio and Video calls.';
        } else {
          stateDescription.textContent = 'Blocked woman: greyed locked Audio Call matches the unlocked fourth tool.';
          scenarioDetail.textContent = 'Blocked woman · Locked: four lower tools; Audio is greyed and locked.';
        }
      }

      function openCallSheet(triggerTool) {
        const chatEntryAvailable = prototypeState.page === 'chat' && prototypeState.composerState === 'configured';
        const profileEntryAvailable = prototypeState.page === 'profile';
        if ((!chatEntryAvailable && !profileEntryAvailable) || prototypeState.accessState !== 'unlocked') {
          showToast('Unlock calling to continue');
          return;
        }
        const audioTrigger = triggerTool === 'Audio Call';
        const callChoice = audioTrigger ? 'Audio Call' : 'Video Call';
        callSheetLayer.classList.toggle('trigger-audio', audioTrigger);
        callSheetLayer.classList.toggle('trigger-video', triggerTool === 'Video Call');
        primaryCallOption.dataset.callChoice = callChoice;
        primaryCallTitle.textContent = callChoice;
        secondaryCallOption.dataset.callChoice = callChoice;
        secondaryCallTitle.textContent = callChoice;
        callSheetLayer.classList.add('open');
        callSheetLayer.setAttribute('aria-hidden', 'false');
        callSheetLayer.removeAttribute('inert');
      }

      function openProfileCallSheet() {
        if (prototypeState.page !== 'profile' || prototypeState.accessState !== 'unlocked') {
          showToast('Unlock calling to continue');
          return;
        }
        profileCallSheetLayer.classList.add('open');
        profileCallSheetLayer.setAttribute('aria-hidden', 'false');
        profileCallSheetLayer.removeAttribute('inert');
      }

      function openIntimacyModal() {
        if (prototypeState.page !== 'profile' || prototypeState.accessState !== 'locked') return;
        intimacyModalLayer.classList.add('open');
        intimacyModalLayer.setAttribute('aria-hidden', 'false');
        intimacyModalLayer.removeAttribute('inert');
      }

      function switchToConfigured() {
        prototypeState.composerState = 'configured';
        renderPrototypeState();
      }

      function syncPhoneScale() {
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth || 393;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight || 852;
        const rawScale = viewportWidth <= 760
          ? Math.min(viewportWidth / 393, viewportHeight / 852, 1)
          : 1;
        const scale = Number.isFinite(rawScale) && rawScale > 0
          ? Math.min(Math.max(rawScale, 0.25), 1)
          : 1;
        document.documentElement.style.setProperty('--phone-scale', String(scale));
      }

      syncPhoneScale();
      window.addEventListener('resize', syncPhoneScale);
      window.addEventListener('pageshow', syncPhoneScale);
      window.requestAnimationFrame(syncPhoneScale);
      renderPrototypeState();

      function wireAssetFallback(image, fallback) {
        const showFallback = () => fallback.classList.add('show');
        image.addEventListener('error', showFallback);
        image.addEventListener('load', () => fallback.classList.remove('show'));
        if (image.complete && image.naturalWidth === 0) showFallback();
      }

      wireAssetFallback(chatProductScreen, chatAssetFallback);
      wireAssetFallback(profileProductScreen, profileAssetFallback);

      pageButtons.forEach((button) => {
        button.addEventListener('click', () => {
          noteDrafts[prototypeState.page] = notes.value;
          prototypeState.page = button.dataset.previewPage;
          notes.value = noteDrafts[prototypeState.page];
          document.querySelectorAll('.is-selected').forEach((node) => node.classList.remove('is-selected'));
          detail.textContent = prototypeState.page === 'profile'
            ? 'Select the User Profile baseline in the phone preview.'
            : 'Select a highlighted component in the phone preview.';
          renderPrototypeState();
        });
      });

      stateButtons.forEach((button) => {
        button.addEventListener('click', () => {
          prototypeState.composerState = button.dataset.composerState;
          renderPrototypeState();
        });
      });

      userTypeButtons.forEach((button) => {
        button.addEventListener('click', () => {
          prototypeState.userType = button.dataset.userType;
          switchToConfigured();
        });
      });

      accessStateButtons.forEach((button) => {
        button.addEventListener('click', () => {
          prototypeState.accessState = button.dataset.accessState;
          switchToConfigured();
        });
      });

      function showToast(message) {
        window.clearTimeout(toastTimer);
        toast.textContent = message;
        toast.classList.add('show');
        toastTimer = window.setTimeout(() => toast.classList.remove('show'), 1600);
      }

      toolButtons.forEach((button) => {
        button.addEventListener('click', () => {
          if (button.dataset.callTrigger === 'true') {
            openCallSheet(button.dataset.tool);
            return;
          }
          if (button.classList.contains('locked')) {
            showToast(`${button.dataset.tool} is locked`);
            return;
          }
          showToast(`${button.dataset.tool} selected`);
        });
      });

      profileCallButton.addEventListener('click', () => {
        if (profileCallButton.classList.contains('locked')) {
          openIntimacyModal();
          return;
        }
        openProfileCallSheet();
      });

      profileVideoBadge.addEventListener('click', () => {
        if (prototypeState.page !== 'profile' || prototypeState.userType !== 'core') return;
        showToast('Officially verified');
      });

      callSheetBackdrop.addEventListener('click', closeCallSheet);
      callSheetCancel.addEventListener('click', closeCallSheet);
      profileCallSheetBackdrop.addEventListener('click', closeCallSheet);
      profileCallSheetCancel.addEventListener('click', closeCallSheet);
      intimacyModalBackdrop.addEventListener('click', closeIntimacyModal);
      callChoiceButtons.forEach((button) => {
        button.addEventListener('click', () => {
          closeCallSheet();
          showToast(`${button.dataset.callChoice} selected`);
        });
      });
      profileCallChoiceButtons.forEach((button) => {
        button.addEventListener('click', () => {
          closeCallSheet();
          showToast(`${button.dataset.profileCallChoice} selected`);
        });
      });
      intimacyActionButtons.forEach((button) => {
        button.addEventListener('click', () => {
          const action = button.dataset.intimacyAction;
          closeIntimacyModal();
          showToast(`${action} selected`);
        });
      });

      send.addEventListener('click', () => {
        const message = input.value.trim();
        if (!message) {
          showToast('Type a message first');
          input.focus();
          return;
        }
        input.value = '';
        showToast('Message sent');
      });

      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();
          send.click();
        }
      });

      document.addEventListener('keydown', (event) => {
        if (
          event.key === 'Escape' &&
          (
            callSheetLayer.classList.contains('open') ||
            profileCallSheetLayer.classList.contains('open') ||
            intimacyModalLayer.classList.contains('open')
          )
        ) {
          closeCallSheet();
          closeIntimacyModal();
        }
      });

      switchButton.addEventListener('click', () => {
        const active = !body.classList.contains('annotation-mode');
        body.classList.toggle('annotation-mode', active);
        switchButton.classList.toggle('active', active);
        switchButton.setAttribute('aria-pressed', String(active));
        document.querySelectorAll('.is-selected').forEach((node) => node.classList.remove('is-selected'));
      });

      document.addEventListener('click', (event) => {
        if (!body.classList.contains('annotation-mode') || window.innerWidth <= 760) return;
        if (event.target.closest('.prototype-action')) return;
        const node = event.target.closest('.annotatable');
        if (!node) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        document.querySelectorAll('.is-selected').forEach((item) => item.classList.remove('is-selected'));
        node.classList.add('is-selected');
        detail.innerHTML = `<strong>${node.dataset.specTitle || 'Component'}</strong><br>${node.dataset.specNote || 'No additional note.'}`;
      }, true);

      try {
        noteDrafts.chat = window.localStorage.getItem(noteStorageKeys.chat) || '';
        noteDrafts.profile = window.localStorage.getItem(noteStorageKeys.profile) || '';
      } catch (error) {
        noteDrafts.chat = '';
        noteDrafts.profile = '';
      }
      notes.value = noteDrafts[prototypeState.page];

      notes.addEventListener('input', () => {
        noteDrafts[prototypeState.page] = notes.value;
      });

      saveNote.addEventListener('click', () => {
        try {
          noteDrafts[prototypeState.page] = notes.value;
          window.localStorage.setItem(noteStorageKeys[prototypeState.page], notes.value);
          showToast('Notes saved');
        } catch (error) {
          showToast('Notes are available for this session only');
        }
      });

      document.documentElement.dataset.prototypeReady = 'true';
    })();
