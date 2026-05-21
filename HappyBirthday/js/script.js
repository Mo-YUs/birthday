/**
 * ========================================
 *  script.js - 生日祝福页面交互脚本
 *  音乐播放 | 纸屑生成 | 爱心粒子 | 交互特效
 *  动态生成16张照片网格
 * ========================================
 */

(function () {
    'use strict';

    // ============ DOM 元素 ============
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicBtn');
    const musicIcon = document.getElementById('musicIcon');
    const musicText = document.getElementById('musicText');
    const musicWave = document.getElementById('musicWave');
    const confettiContainer = document.getElementById('confettiContainer');
    const heartsLayer = document.getElementById('heartsLayer');
    const balloonsContainer = document.getElementById('balloonsContainer');
    const blessingText = document.getElementById('blessingText');
    const footerDate = document.getElementById('footerDate');
    const cakeWrapper = document.querySelector('.cake-wrapper');
    const photoGallery = document.getElementById('photoGallery');

    // ============ 状态变量 ============
    let isMusicPlaying = false;
    let musicLoaded = false;
    let musicError = false;
    let confettiInterval = null;
    let balloonRefreshInterval = null;

    // ============ 初始化 ============
    function init() {
        // 设置日期
        setFooterDate();
        // 初始化音乐
        initMusic();
        // 动态生成16张照片
        renderPhotoCards();
        // 开始生成纸屑
        startConfetti();
        // 定期刷新气球
        startBalloonRefresh();
        // 绑定事件
        bindEvents();
        // 打印欢迎信息
        console.log('🎂 生日快乐！愿美好与你相伴！🎂');
        console.log('💡 提示：点击音乐按钮播放生日歌');
        console.log('💡 点击蛋糕或屏幕任意位置会有惊喜哦~');
    }

    // ============ 底部日期 ============
    function setFooterDate() {
    if (footerDate) {
        footerDate.textContent = '📅 2025年5月22日';
    }
}

    // ============ 音乐播放管理 ============
    function initMusic() {
        if (!bgMusic) return;

        // 监听音乐加载成功
        bgMusic.addEventListener('loadeddata', function () {
            musicLoaded = true;
            musicError = false;
            updateMusicButtonState();
            console.log('✅ 音乐加载成功');
        });

        // 监听音乐加载失败
        bgMusic.addEventListener('error', function () {
            musicError = true;
            musicLoaded = false;
            updateMusicButtonState();
            console.warn('⚠️ 音乐文件加载失败，请在 music 文件夹中放入 happy-birthday.mp3 文件');
            console.warn('💡 您也可以使用在线生日歌资源替换音频路径');
        });

        // 监听播放事件
        bgMusic.addEventListener('play', function () {
            isMusicPlaying = true;
            updateMusicButtonState();
        });

        // 监听暂停事件
        bgMusic.addEventListener('pause', function () {
            isMusicPlaying = false;
            updateMusicButtonState();
        });

        // 尝试加载（如果src存在）
        if (bgMusic.src && bgMusic.src !== window.location.href) {
            bgMusic.load();
        }

        // 设置备用的在线音乐源（如果本地文件加载失败）
        setupFallbackMusic();
    }

    function setupFallbackMusic() {
        if (!bgMusic) return;

        // 如果3秒后仍未加载成功，尝试备用URL
        setTimeout(function () {
            if (!musicLoaded && !musicError) {
                // 可以在这里设置备用在线音乐URL
                // 例如：bgMusic.src = 'https://example.com/happy-birthday.mp3';
                // bgMusic.load();
                console.log('💡 正在尝试加载音乐...');
            }
            if (musicError) {
                console.log('💡 请在 music 文件夹中添加名为 happy-birthday.mp3 的音乐文件');
                console.log('💡 支持的格式：MP3、WAV、OGG 等');
            }
        }, 3000);
    }

    function updateMusicButtonState() {
        if (!musicBtn || !musicIcon || !musicText || !musicWave) return;

        // 移除所有状态类
        musicBtn.classList.remove('playing', 'error');

        if (musicError) {
            musicBtn.classList.add('error');
            musicIcon.textContent = '🚫';
            musicText.textContent = '音乐未找到';
            musicWave.style.opacity = '0';
        } else if (isMusicPlaying) {
            musicBtn.classList.add('playing');
            musicIcon.textContent = '🎶';
            musicText.textContent = '正在播放...';
            musicWave.style.opacity = '1';
        } else if (musicLoaded) {
            musicIcon.textContent = '🎵';
            musicText.textContent = '点击播放音乐';
            musicWave.style.opacity = '0';
        } else {
            musicIcon.textContent = '🎵';
            musicText.textContent = '加载中...';
            musicWave.style.opacity = '0';
        }
    }

    function toggleMusic() {
        if (!bgMusic) return;

        if (musicError) {
            // 音乐加载失败，给出提示
            shakeElement(musicBtn);
            console.log('⚠️ 音乐文件未找到，请在 music 文件夹中添加 happy-birthday.mp3');
            return;
        }

        if (isMusicPlaying) {
            bgMusic.pause();
        } else {
            // 如果还没加载，先加载
            if (!musicLoaded && bgMusic.src && bgMusic.src !== window.location.href) {
                bgMusic.load();
            }
            // 尝试播放
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(function () {
                        // 播放成功
                        console.log('🎶 音乐开始播放');
                    })
                    .catch(function (err) {
                        console.warn('⚠️ 音乐播放被阻止，请手动点击播放:', err.message);
                        isMusicPlaying = false;
                        updateMusicButtonState();
                    });
            }
        }
    }

    function shakeElement(el) {
        if (!el) return;
        el.style.animation = 'none';
        void el.offsetWidth; // 触发回流
        el.style.animation = 'shake 0.5s ease';
        setTimeout(function () {
            el.style.animation = '';
        }, 500);
    }

    // ============ 动态生成16张照片卡片 ============
    function renderPhotoCards() {
        if (!photoGallery) return;

        const totalPhotos = 16;
        const emojiList = ['📷', '🎂', '🎁', '🎈', '🎉', '✨', '🌟', '💝', '🎀', '🍰', '🧁', '🎊', '💐', '🕯️', '🎶', '💖'];

        // 清空容器
        photoGallery.innerHTML = '';

        for (let i = 1; i <= totalPhotos; i++) {
            const card = document.createElement('div');
            card.className = 'photo-card';

            const img = document.createElement('img');
            img.src = `images/photo${i}.jpg`;
            img.alt = `美好回忆${i}`;
            img.className = 'photo-img';
            img.loading = 'lazy';  // 延迟加载，提升性能

            // 加载失败时显示占位符
            img.onerror = function () {
                this.style.display = 'none';
                card.classList.add('photo-placeholder');
            };

            // 占位图标
            const placeholder = document.createElement('div');
            placeholder.className = 'photo-placeholder-fallback';
            placeholder.textContent = emojiList[i - 1] || '📸';

            card.appendChild(img);
            card.appendChild(placeholder);
            photoGallery.appendChild(card);
        }

        // 为新卡片绑定点击事件（放大预览 + 爱心特效）
        bindPhotoCardEvents();
    }

    function bindPhotoCardEvents() {
        document.querySelectorAll('.photo-card').forEach(function (card) {
            // 移除旧事件（避免重复绑定）
            card.removeEventListener('click', handlePhotoCardClick);
            card.addEventListener('click', handlePhotoCardClick);
        });
    }

    function handlePhotoCardClick(e) {
        const card = e.currentTarget;
        const img = card.querySelector('.photo-img');
        if (img && img.style.display !== 'none' && img.src && !img.src.endsWith('/')) {
            openImagePreview(img.src, img.alt);
        }
        // 点击照片时触发小爱心
        burstHearts(e.clientX, e.clientY, 5);
    }

    // ============ 图片预览 ============
    function openImagePreview(src, alt) {
        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            z-index: 1000;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            backdrop-filter: blur(5px);
            animation: fadeIn 0.3s ease;
        `;

        const previewImg = document.createElement('img');
        previewImg.src = src;
        previewImg.alt = alt;
        previewImg.style.cssText = `
            max-width: 90%;
            max-height: 85vh;
            border-radius: 12px;
            box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            object-fit: contain;
            animation: zoomIn 0.3s ease;
        `;

        overlay.appendChild(previewImg);
        document.body.appendChild(overlay);

        // 点击关闭
        overlay.addEventListener('click', function () {
            overlay.style.animation = 'fadeOut 0.25s ease';
            setTimeout(function () {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 250);
        });

        // ESC键关闭
        const escHandler = function (e) {
            if (e.key === 'Escape') {
                overlay.click();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }

    // ============ 纸屑生成 ============
    function startConfetti() {
        // 初始生成一批纸屑
        for (let i = 0; i < 20; i++) {
            setTimeout(function () {
                createConfettiPiece();
            }, i * 150);
        }
        // 持续生成纸屑
        confettiInterval = setInterval(function () {
            if (document.hidden) return; // 页面不可见时暂停
            createConfettiPiece();
            // 限制纸屑数量
            const pieces = confettiContainer.querySelectorAll('.confetti-piece');
            if (pieces.length > 60) {
                pieces[0].remove();
            }
        }, 800);
    }

    function createConfettiPiece() {
        if (!confettiContainer) return;

        const piece = document.createElement('div');
        piece.classList.add('confetti-piece');

        // 随机颜色
        const colors = [
            '#ff6b6b', '#ffd93d', '#6bcb77', '#48dbfb',
            '#ff922b', '#a29bfe', '#ff6b9d', '#feca57',
            '#54a0ff', '#5f27cd', '#ff9ff3', '#00d2d3',
            '#f368e0', '#ff6348', '#7bed9f', '#e056a0',
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // 随机位置
        const leftPos = Math.random() * 95;

        // 随机大小
        const size = Math.random() * 10 + 6;

        // 随机动画时长
        const duration = Math.random() * 5 + 4;

        // 随机形状
        const shapes = ['50%', '3px', '1px', '50%', '3px', '2px'];
        const borderRadius = shapes[Math.floor(Math.random() * shapes.length)];

        piece.style.cssText = `
            left: ${leftPos}%;
            width: ${size}px;
            height: ${size * (Math.random() * 0.8 + 0.5)}px;
            background: ${randomColor};
            border-radius: ${borderRadius};
            animation-duration: ${duration}s;
            animation-delay: ${Math.random() * 0.5}s;
            opacity: ${Math.random() * 0.4 + 0.6};
        `;

        confettiContainer.appendChild(piece);

        // 动画结束后移除
        const removeDelay = (duration + 0.5) * 1000;
        setTimeout(function () {
            if (piece.parentNode) {
                piece.remove();
            }
        }, removeDelay);
    }

    // 手动触发纸屑爆发
    function burstConfetti(count) {
        count = count || 30;
        for (let i = 0; i < count; i++) {
            setTimeout(function () {
                createConfettiPiece();
            }, i * 30);
        }
    }

    // ============ 气球刷新 ============
    function startBalloonRefresh() {
        balloonRefreshInterval = setInterval(function () {
            if (document.hidden) return;
            refreshBalloons();
        }, 15000); // 每15秒检查并刷新气球
    }

    function refreshBalloons() {
        if (!balloonsContainer) return;
        const balloons = balloonsContainer.querySelectorAll('.balloon');
        balloons.forEach(function (balloon) {
            // 重置动画（让气球重新升起）
            balloon.style.animation = 'none';
            void balloon.offsetWidth;
            balloon.style.animation = '';
        });
    }

    // ============ 爱心粒子 ============
    function createHeartParticle(x, y) {
        if (!heartsLayer) return;

        const heart = document.createElement('div');
        heart.classList.add('heart-particle');

        const emojis = ['❤️', '💕', '💖', '💗', '💝', '✨', '🌟', '💛', '🧡', '💜', '🩷'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        const size = Math.random() * 1.5 + 1;
        const offsetX = (Math.random() - 0.5) * 60;
        const duration = Math.random() * 1.5 + 1.8;

        heart.textContent = randomEmoji;
        heart.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            font-size: ${size}rem;
            animation-duration: ${duration}s;
        `;
        heart.style.setProperty('--tx', offsetX + 'px');

        heartsLayer.appendChild(heart);

        // 动画结束后移除
        setTimeout(function () {
            if (heart.parentNode) {
                heart.remove();
            }
        }, duration * 1000 + 200);
    }

    // 批量生成爱心
    function burstHearts(x, y, count) {
        count = count || 12;
        for (let i = 0; i < count; i++) {
            setTimeout(function () {
                const offsetX = (Math.random() - 0.5) * 40;
                const offsetY = (Math.random() - 0.5) * 30;
                createHeartParticle(x + offsetX, y + offsetY);
            }, i * 40);
        }
    }

    // ============ 事件绑定 ============
    function bindEvents() {
        // 音乐按钮点击
        if (musicBtn) {
            musicBtn.addEventListener('click', function (e) {
                e.preventDefault();
                toggleMusic();
            });

            // 触摸事件（移动端优化）
            musicBtn.addEventListener('touchend', function (e) {
                e.preventDefault();
                toggleMusic();
            });
        }

        // 点击蛋糕区域 - 纸屑爆发 + 爱心
        if (cakeWrapper) {
            cakeWrapper.addEventListener('click', function (e) {
                burstConfetti(35);
                burstHearts(e.clientX, e.clientY, 15);
            });

            cakeWrapper.addEventListener('touchend', function (e) {
                const touch = e.changedTouches[0];
                burstConfetti(30);
                burstHearts(touch.clientX, touch.clientY, 12);
            });
        }

        // 点击页面其他区域也触发小效果
        document.addEventListener('click', function (e) {
            // 排除已绑定事件的元素
            if (e.target.closest('.music-btn')) return;
            if (e.target.closest('.cake-wrapper')) return;
            if (e.target.closest('.photo-card')) return;

            // 随机触发爱心
            if (Math.random() < 0.5) {
                burstHearts(e.clientX, e.clientY, 6);
            }
        });

        // 双击页面触发大型纸屑雨
        document.addEventListener('dblclick', function (e) {
            burstConfetti(60);
            burstHearts(e.clientX, e.clientY, 25);
        });

        // 键盘快捷键
        document.addEventListener('keydown', function (e) {
            switch (e.key.toLowerCase()) {
                case 'm':
                    // M键切换音乐
                    toggleMusic();
                    break;
                case 'c':
                    // C键触发纸屑
                    burstConfetti(40);
                    break;
                case 'h':
                    // H键触发爱心
                    const cx = window.innerWidth / 2;
                    const cy = window.innerHeight / 2;
                    burstHearts(cx, cy, 20);
                    break;
                case ' ':
                    // 空格键触发大型效果
                    e.preventDefault();
                    burstConfetti(50);
                    const scx = window.innerWidth / 2;
                    const scy = window.innerHeight / 2;
                    burstHearts(scx, scy, 30);
                    break;
                default:
                    break;
            }
        });

        // 页面可见性变化时管理资源
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) {
                // 页面不可见时减少资源消耗
                if (confettiInterval) {
                    clearInterval(confettiInterval);
                    confettiInterval = null;
                }
            } else {
                // 页面重新可见时恢复
                if (!confettiInterval) {
                    startConfetti();
                }
            }
        });

        // 窗口大小改变时清理过多纸屑
        let resizeTimeout;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function () {
                if (confettiContainer) {
                    const pieces = confettiContainer.querySelectorAll('.confetti-piece');
                    if (pieces.length > 40) {
                        for (let i = 0; i < pieces.length - 30; i++) {
                            pieces[i].remove();
                        }
                    }
                }
            }, 500);
        });
    }

    // ============ 动态添加CSS动画关键帧 ============
    function injectDynamicStyles() {
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                20% { transform: translateX(-8px); }
                40% { transform: translateX(8px); }
                60% { transform: translateX(-5px); }
                80% { transform: translateX(5px); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            @keyframes zoomIn {
                from { transform: scale(0.7); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            @keyframes heartFloat {
                0% {
                    transform: translateY(0) translateX(0) scale(0.5) rotate(0deg);
                    opacity: 1;
                }
                40% {
                    transform: translateY(-60px) translateX(var(--tx, 0)) scale(1.2) rotate(15deg);
                    opacity: 0.9;
                }
                70% {
                    transform: translateY(-90px) translateX(calc(var(--tx, 0) * -0.5)) scale(1) rotate(-10deg);
                    opacity: 0.5;
                }
                100% {
                    transform: translateY(-150px) translateX(var(--tx, 0)) scale(0.3) rotate(30deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // ============ 启动 ============
    injectDynamicStyles();
    init();

    // ============ 暴露API到全局 ============
    window.birthdayAPI = {
        toggleMusic: toggleMusic,
        burstConfetti: burstConfetti,
        burstHearts: burstHearts,
        isMusicPlaying: function () {
            return isMusicPlaying;
        },
        getMusicStatus: function () {
            return {
                playing: isMusicPlaying,
                loaded: musicLoaded,
                error: musicError,
            };
        },
    };

    console.log('✅ 生日祝福页面初始化完成！');
    console.log('🎮 交互提示：');
    console.log('  - 点击 🎵 按钮播放/暂停音乐');
    console.log('  - 点击蛋糕触发纸屑和爱心');
    console.log('  - 双击页面触发大型特效');
    console.log('  - 按 M 键切换音乐');
    console.log('  - 按 空格键 触发惊喜');
    console.log('  - 点击照片可放大预览');
    console.log('  - 可通过 window.birthdayAPI 控制特效');
})();