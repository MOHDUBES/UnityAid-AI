// ============================================================
// UNITYAID AI - COMPLETE SCRIPT (Clean Rewrite)
// ============================================================

// --- AUTH FUNCTIONS (global scope, needed for onclick in HTML) ---

window.isSignUpMode = false;

window.toggleGateMode = function() {
    window.isSignUpMode = !window.isSignUpMode;
    var title = document.getElementById('gate-title');
    var subtitle = document.getElementById('gate-subtitle');
    var submitBtn = document.getElementById('gate-login-btn');
    var footerText = document.getElementById('gate-footer-text');
    var toggleLink = document.getElementById('gate-toggle-link');
    var socialSection = document.getElementById('social-auth-section');
    var nameField = document.getElementById('gate-name');

    if (window.isSignUpMode) {
        if (title) title.innerText = 'Create Account';
        if (subtitle) subtitle.innerText = 'Join the UnityAid community.';
        if (submitBtn) submitBtn.innerText = 'Register & Enter';
        if (footerText) footerText.innerText = 'Already have an account?';
        if (toggleLink) toggleLink.innerText = 'Login';
        if (socialSection) socialSection.classList.add('hidden');
        if (nameField) nameField.placeholder = 'Full Name (required)';
    } else {
        if (title) title.innerText = 'UnityAid AI';
        if (subtitle) subtitle.innerText = 'Securing community coordination.';
        if (submitBtn) submitBtn.innerText = 'Unlock Application';
        if (footerText) footerText.innerText = "Don't have an account?";
        if (toggleLink) toggleLink.innerText = 'Sign up';
        if (socialSection) socialSection.classList.remove('hidden');
        if (nameField) nameField.placeholder = 'Your Name (optional)';
    }
};

window.handleGateAction = function() {
    var nameInput = document.getElementById('gate-name');
    var name = nameInput ? nameInput.value.trim() : '';
    var email = (document.getElementById('gate-email') || {}).value || '';
    var password = (document.getElementById('gate-password') || {}).value || '';
    var btn = document.getElementById('gate-login-btn');

    // In signup mode, name is required
    if (window.isSignUpMode && name.length < 2) {
        alert('Please enter your full name');
        return;
    }
    if (!email || email.indexOf('@') === -1) {
        alert('Please enter a valid email address');
        return;
    }
    if (!password || password.length < 4) {
        alert('Password must be at least 4 characters');
        return;
    }

    if (btn) btn.innerText = 'Processing...';

    setTimeout(function() {
        // Use entered name, or stored name, or email prefix as last resort
        var finalName = name;
        if (!finalName) {
            // Try to get previously stored name for this email
            try {
                var existing = JSON.parse(localStorage.getItem('unityaid_user') || '{}');
                if (existing.email === email && existing.name) {
                    finalName = existing.name;
                }
            } catch(e) {}
        }
        if (!finalName) {
            // Capitalize email prefix nicely
            var prefix = email.split('@')[0];
            finalName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }

        var userData = {
            email: email,
            name: finalName,
            avatar: finalName.charAt(0).toUpperCase()
        };
        localStorage.setItem('unityaid_user', JSON.stringify(userData));
        location.reload();
    }, 800);
};

window.simulateGateSocial = function(platform) {
    var btn = document.querySelector('.' + platform + '-gate-btn');
    if (btn) btn.innerText = 'Connecting...';
    setTimeout(function() {
        var userData = {
            email: 'user@' + platform + '.com',
            name: platform === 'google' ? 'Google User' : 'Apple User',
            avatar: platform.charAt(0).toUpperCase()
        };
        localStorage.setItem('unityaid_user', JSON.stringify(userData));
        location.reload();
    }, 800);
};

// ============================================================
// GLOBAL ONCLICK HANDLERS — fully self-contained for mobile
// ============================================================

window.toggleMobileMenu = function(e) {
    if (e) e.stopPropagation();
    var sidebar = document.querySelector('.sidebar');
    var overlay = document.querySelector('.sidebar-overlay');
    if (!sidebar) return;
    sidebar.classList.toggle('active');
    if (overlay) overlay.style.display = sidebar.classList.contains('active') ? 'block' : 'none';
};

window.togglePdfMenu = function(e) {
    if (e) e.stopPropagation();
    var menu = document.getElementById('pdf-menu');
    if (!menu) return;
    var isOpen = menu.classList.contains('show');
    // Close all menus
    ['pdf-menu','header-more-menu','profile-menu','plus-menu'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.classList.remove('show');
    });
    if (!isOpen) menu.classList.add('show');
};

window.saveChatAsPDF = function() {
    window.print();
};

// --- APP STARTS AFTER DOM IS READY ---

document.addEventListener('DOMContentLoaded', function() {

    // --- 1. AUTH CHECK ---
    var loginGate = document.getElementById('login-gate');
    var mainApp = document.getElementById('main-app');
    var userStr = localStorage.getItem('unityaid_user');
    var currentUser = null;

    if (userStr) {
        try {
            currentUser = JSON.parse(userStr);
        } catch(e) {
            localStorage.removeItem('unityaid_user');
        }
    }

    if (currentUser) {
        // Logged in — show app, hide gate
        if (loginGate) { loginGate.style.display = 'none'; }
        if (mainApp) {
            mainApp.classList.remove('blur-hidden');
            mainApp.style.display = 'flex';
            mainApp.style.visibility = 'visible';
            mainApp.style.opacity = '1';
        }
        // Update profile in sidebar
        var profileName = document.querySelector('.user-name');
        var profileAvatar = document.querySelector('.user-avatar');
        var profileStatus = document.querySelector('.user-status');
        if (profileName) profileName.innerText = currentUser.name || 'User';
        if (profileAvatar) profileAvatar.innerText = currentUser.avatar || 'U';
        if (profileStatus) profileStatus.innerText = 'UnityAid Coordinator';
    } else {
        // Not logged in — show gate, hide app
        if (loginGate) { loginGate.style.display = 'flex'; }
        if (mainApp) {
            mainApp.classList.add('blur-hidden');
            mainApp.style.display = 'none';
        }
    }

    // --- 2. LOGOUT ---
    var logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = function(e) {
            e.stopPropagation();
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('unityaid_user');
                location.reload();
            }
        };
    }

    // --- 3. DOM ELEMENTS ---
    var chatForm = document.getElementById('chat-form');
    var userInput = document.getElementById('user-input');
    var chatBox = document.getElementById('chat-box');
    var messagesContainer = document.getElementById('messages');
    var typingContainer = document.getElementById('typing-container');
    var welcomeScreen = document.getElementById('welcome-screen');
    var sendBtn = document.getElementById('send-btn');
    var historyList = document.getElementById('chat-history-list');
    var newChatBtn = document.getElementById('new-chat-btn');
    var voiceBtn = document.getElementById('voice-input-btn');
    var plusBtn = document.getElementById('plus-btn');
    var plusMenu = document.getElementById('plus-menu');
    var settingsBtn = document.getElementById('settings-btn');
    var headerMoreMenu = document.getElementById('header-more-menu');
    var userProfileCard = document.getElementById('user-profile-card');
    var profileMenu = document.getElementById('profile-menu');
    var shareBtn = document.getElementById('share-btn');
    var pdfTrigger = document.getElementById('pdf-trigger');
    var pdfMenu = document.getElementById('pdf-menu');
    var fontSelect = document.getElementById('font-select');
    var fontSizeSelect = document.getElementById('font-size-select');

    // --- 4. APP STATE ---
    var chats = [];
    try {
        var stored = localStorage.getItem('smartassist_chats');
        if (stored) chats = JSON.parse(stored);
        if (!Array.isArray(chats)) chats = [];
    } catch(e) { chats = []; }

    var activeChatId = chats.length > 0 ? chats[0].id : null;
    var isProcessing = false;

    // --- 5. CORE FUNCTIONS ---

    function renderMessage(text, sender) {
        if (!messagesContainer) return;
        if (sender === 'user') {
            var div = document.createElement('div');
            div.className = 'message user message-user';
            div.textContent = text;
            messagesContainer.appendChild(div);
        } else {
            var wrapper = document.createElement('div');
            wrapper.className = 'message-bot-container';
            var iconEl = document.createElement('i');
            iconEl.className = 'fas fa-hand-holding-heart bot-avatar-small';
            var msgDiv = document.createElement('div');
            msgDiv.className = 'message bot message-bot';
            try {
                if (typeof marked !== 'undefined') {
                    msgDiv.innerHTML = marked.parse(text);
                } else {
                    msgDiv.textContent = text;
                }
            } catch(err) {
                msgDiv.textContent = text;
            }
            wrapper.appendChild(iconEl);
            wrapper.appendChild(msgDiv);
            messagesContainer.appendChild(wrapper);
        }
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }

    function setLoading(loading) {
        isProcessing = loading;
        if (typingContainer) {
            if (loading) typingContainer.classList.remove('hidden');
            else typingContainer.classList.add('hidden');
        }
        if (sendBtn) {
            sendBtn.disabled = loading;
            sendBtn.style.background = loading ? '#3c3d3e' : '#ffffff';
        }
    }

    function saveMessageToCurrentChat(role, content) {
        var chat = chats.find(function(c) { return c.id === activeChatId; });
        if (!chat) {
            chat = { id: Date.now(), title: content.substring(0, 25), messages: [] };
            chats.unshift(chat);
            activeChatId = chat.id;
        }
        chat.messages.push({ role: role, content: content });
        if (chat.messages.length === 1 && role === 'user') {
            chat.title = content.substring(0, 25);
        }
        updateStorage();
    }

    function updateStorage() {
        localStorage.setItem('smartassist_chats', JSON.stringify(chats));
        renderHistoryList();
    }

    function renderHistoryList() {
        if (!historyList) return;
        historyList.innerHTML = '';
        chats.forEach(function(chat) {
            var li = document.createElement('li');
            li.className = 'history-item' + (chat.id === activeChatId ? ' active' : '');
            var titleSpan = document.createElement('span');
            titleSpan.className = 'chat-title-text';
            titleSpan.textContent = chat.title || 'New Chat';
            titleSpan.onclick = function() { switchChat(chat.id); };
            var optBtn = document.createElement('button');
            optBtn.className = 'chat-options-btn';
            optBtn.innerHTML = '<i class="fas fa-ellipsis-h"></i>';
            optBtn.onclick = function(e) { e.stopPropagation(); showContextMenu(e, chat.id); };
            li.appendChild(titleSpan);
            li.appendChild(optBtn);
            historyList.appendChild(li);
        });
    }

    function showContextMenu(e, chatId) {
        var menu = document.getElementById('chat-context-menu');
        if (!menu) return;
        menu.style.top = e.clientY + 'px';
        menu.style.left = (e.clientX - 160) + 'px';
        menu.classList.add('show');
        var deleteBtn = document.getElementById('delete-chat-opt');
        if (deleteBtn) {
            deleteBtn.onclick = function() { deleteChat(chatId); menu.classList.remove('show'); };
        }
        var renameBtn = document.getElementById('rename-chat-opt');
        if (renameBtn) {
            renameBtn.onclick = function() {
                var newTitle = prompt('Enter new title:', 'New Title');
                if (newTitle) {
                    var chat = chats.find(function(c) { return c.id === chatId; });
                    if (chat) chat.title = newTitle;
                    updateStorage();
                }
                menu.classList.remove('show');
            };
        }
        setTimeout(function() {
            document.addEventListener('click', function closeMenu() {
                menu.classList.remove('show');
                document.removeEventListener('click', closeMenu);
            });
        }, 10);
    }

    function deleteChat(id) {
        var index = chats.findIndex(function(c) { return c.id === id; });
        if (index > -1) {
            chats.splice(index, 1);
            if (activeChatId === id) {
                activeChatId = chats.length > 0 ? chats[0].id : null;
                if (activeChatId) switchChat(activeChatId);
                else {
                    if (messagesContainer) messagesContainer.innerHTML = '';
                    if (welcomeScreen) welcomeScreen.classList.remove('hidden');
                }
            }
            updateStorage();
        }
    }

    function switchChat(id) {
        activeChatId = id;
        var chat = chats.find(function(c) { return c.id === id; });
        if (messagesContainer) messagesContainer.innerHTML = '';
        if (chat && chat.messages.length > 0) {
            if (welcomeScreen) welcomeScreen.classList.add('hidden');
            chat.messages.forEach(function(m) { renderMessage(m.content, m.role); });
        } else {
            if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        }
        renderHistoryList();
    }

    function createNewChat() {
        closeAllPopups();
        var id = Date.now();
        chats.unshift({ id: id, title: 'New Chat', messages: [] });
        switchChat(id);
    }

    function performChat(messageText) {
        if (!messageText || !messageText.trim() || isProcessing) return;
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        renderMessage(messageText, 'user');
        saveMessageToCurrentChat('user', messageText);
        if (userInput) userInput.value = '';
        setLoading(true);

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageText })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            renderMessage(data.reply || 'Something went wrong.', 'bot');
            saveMessageToCurrentChat('bot', data.reply || '');
        })
        .catch(function(err) {
            renderMessage('⚠️ Could not connect to UnityAid server.', 'bot');
        })
        .finally(function() {
            setLoading(false);
        });
    }

    function closeAllPopups() {
        if (plusMenu) plusMenu.classList.remove('show');
        if (pdfMenu) pdfMenu.classList.remove('show');
        if (headerMoreMenu) headerMoreMenu.classList.remove('show');
        if (profileMenu) profileMenu.classList.remove('show');
        var ctxMenu = document.getElementById('chat-context-menu');
        if (ctxMenu) ctxMenu.classList.remove('show');
    }

    // --- 6. GLOBAL HOOKS FOR HTML onclick ---
    // triggerQuickTask is already global but override to use performChat
    window.triggerQuickTask = function(msg) { performChat(msg); };
    window.sendMessage = function() { if (userInput) performChat(userInput.value); };

    // --- 7. EVENT LISTENERS ---

    if (chatForm) {
        chatForm.onsubmit = function(e) {
            e.preventDefault();
            if (userInput) performChat(userInput.value);
        };
    }

    if (newChatBtn) newChatBtn.onclick = createNewChat;

    // Plus menu
    if (plusBtn && plusMenu) {
        plusBtn.onclick = function(e) {
            e.stopPropagation();
            var isOpen = plusMenu.classList.contains('show');
            closeAllPopups();
            if (!isOpen) plusMenu.classList.add('show');
        };
    }

    // Settings / More Options
    if (settingsBtn && headerMoreMenu) {
        settingsBtn.onclick = function(e) {
            e.stopPropagation();
            var isOpen = headerMoreMenu.classList.contains('show');
            closeAllPopups();
            if (!isOpen) headerMoreMenu.classList.add('show');
        };
    }

    // Profile menu
    if (userProfileCard && profileMenu) {
        userProfileCard.onclick = function(e) {
            e.stopPropagation();
            var isOpen = profileMenu.classList.contains('show');
            closeAllPopups();
            if (!isOpen) profileMenu.classList.add('show');
        };
    }

    // Close popups on background click — but NOT if clicking inside a menu or on a trigger
    document.addEventListener('click', function(e) {
        var menuIds = ['pdf-menu', 'header-more-menu', 'profile-menu', 'plus-menu', 'chat-context-menu'];
        var triggerIds = ['pdf-trigger', 'plus-btn', 'settings-btn', 'user-profile-card'];

        // Check if click is inside any open menu
        var insideMenu = menuIds.some(function(id) {
            var el = document.getElementById(id);
            return el && el.contains(e.target);
        });

        // Check if click is on a trigger button
        var onTrigger = triggerIds.some(function(id) {
            var el = document.getElementById(id);
            return el && (el === e.target || el.contains(e.target));
        });

        if (!insideMenu && !onTrigger) {
            closeAllPopups();
        }
    });

    // Share button
    if (shareBtn) {
        shareBtn.onclick = function() {
            if (navigator.share) {
                navigator.share({ title: 'UnityAid AI', url: window.location.href }).catch(function() {});
            } else {
                var dummy = document.createElement('textarea');
                document.body.appendChild(dummy);
                dummy.value = window.location.href;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
                alert('Link copied to clipboard!');
            }
        };
    }

    // Theme toggle
    var themeToggleMenu = document.getElementById('theme-toggle-menu');
    if (themeToggleMenu) {
        themeToggleMenu.onclick = function() {
            document.body.classList.toggle('dark-mode');
        };
    }

    // Clear history
    var clearHistoryMenu = document.getElementById('clear-history-menu');
    if (clearHistoryMenu) {
        clearHistoryMenu.onclick = function() {
            if (confirm('Delete all chats?')) {
                chats = [];
                activeChatId = null;
                updateStorage();
                if (messagesContainer) messagesContainer.innerHTML = '';
                if (welcomeScreen) welcomeScreen.classList.remove('hidden');
                closeAllPopups();
            }
        };
    }

    // Font settings
    if (fontSelect) {
        fontSelect.onchange = function(e) { document.body.style.fontFamily = e.target.value; };
    }
    if (fontSizeSelect) {
        fontSizeSelect.onchange = function(e) {
            var map = { '1rem': '16px', '0.85rem': '14px', '1.2rem': '18px', '1.4rem': '20px' };
            document.documentElement.style.fontSize = map[e.target.value] || '16px';
        };
    }

    // Voice input
    if (voiceBtn && ('webkitSpeechRecognition' in window)) {
        var recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.onresult = function(e) {
            if (userInput) {
                userInput.value = e.results[0][0].transcript;
                userInput.focus();
            }
        };
        voiceBtn.onclick = function() {
            recognition.start();
            voiceBtn.style.color = '#10a37f';
            setTimeout(function() { voiceBtn.style.color = ''; }, 3000);
        };
    }

    // Submenu toggle
    document.querySelectorAll('.has-submenu').forEach(function(item) {
        item.onclick = function(e) {
            e.stopPropagation();
            var wasActive = item.classList.contains('active');
            document.querySelectorAll('.has-submenu').forEach(function(s) { s.classList.remove('active'); });
            if (!wasActive) item.classList.add('active');
        };
    });

    // File upload
    var fileUploadBtn = document.getElementById('file-upload-btn');
    var fileUploadInput = document.getElementById('file-upload-input');
    if (fileUploadBtn && fileUploadInput) {
        fileUploadBtn.onclick = function() { fileUploadInput.click(); };
        fileUploadInput.onchange = function(e) {
            var file = e.target.files[0];
            if (file) {
                renderMessage('Attached: ' + file.name, 'user');
                renderMessage('File received. Processing "' + file.name + '"...', 'bot');
            }
        };
    }

    // Close sidebar on outside click (mobile)
    window.addEventListener('click', function(e) {
        var sidebar = document.querySelector('.sidebar');
        var overlay = document.querySelector('.sidebar-overlay');
        var menuBtn = document.getElementById('mobile-menu-btn');
        if (sidebar && sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuBtn) {
            sidebar.classList.remove('active');
            if (overlay) overlay.style.display = 'none';
        }
    });

    // --- 8. INITIAL LOAD ---
    if (chats.length === 0) createNewChat();
    else switchChat(chats[0].id);

});
