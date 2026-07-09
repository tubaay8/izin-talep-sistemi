const navbarToggle = document.getElementById('navbar-toggle');
const navbarLinks = document.getElementById('navbar-links');

navbarToggle.addEventListener('click', () => {
  navbarLinks.classList.toggle('open');
});

navbarLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navbarLinks.classList.remove('open');
  });
});

// Duyuru slider
const slider = document.getElementById('announcement-slider');
const dotsContainer = document.getElementById('announcement-dots');

if (slider && dotsContainer) {
  const slides = Array.from(slider.querySelectorAll('.announcement-slide'));
  let activeIndex = 0;
  let autoTimer = null;

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Duyuru ${index + 1}`);
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(index));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('button'));

  function goToSlide(nextIndex) {
    if (nextIndex === activeIndex) return;
    slides[activeIndex].classList.remove('active');
    slides[activeIndex].classList.add('leaving');
    setTimeout(() => slides[activeIndex].classList.remove('leaving'), 500);

    slides[nextIndex].classList.add('active');
    dots[activeIndex].classList.remove('active');
    dots[nextIndex].classList.add('active');
    activeIndex = nextIndex;
  }

  function startAutoRotate() {
    autoTimer = setInterval(() => {
      const nextIndex = (activeIndex + 1) % slides.length;
      goToSlide(nextIndex);
    }, 5000);
  }

  startAutoRotate();
}

// Yaklasan resmi tatiller (dinamik, siralanmis, gecmis olanlar gizli)
const holidayList = document.getElementById('holiday-list');

if (holidayList) {
  const monthNamesShort = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const holidays = [
    { month: 0, day: 1, name: 'Yılbaşı' },
    { month: 3, day: 23, name: 'Ulusal Egemenlik ve Çocuk Bayramı' },
    { month: 4, day: 19, name: "Atatürk'ü Anma Gençlik ve Spor Bayramı" },
    { month: 6, day: 15, name: 'Demokrasi ve Milli Birlik Günü' },
    { month: 9, day: 29, name: 'Cumhuriyet Bayramı' },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcoming = holidays
    .map((holiday) => {
      let date = new Date(today.getFullYear(), holiday.month, holiday.day);
      if (date < today) {
        date = new Date(today.getFullYear() + 1, holiday.month, holiday.day);
      }
      return { name: holiday.name, date };
    })
    .sort((a, b) => a.date - b.date);

  upcoming.forEach((holiday) => {
    const li = document.createElement('li');

    const dateSpan = document.createElement('span');
    dateSpan.className = 'holiday-date';
    dateSpan.textContent = `${holiday.date.getDate()} ${monthNamesShort[holiday.date.getMonth()]}`;

    const nameSpan = document.createElement('span');
    nameSpan.className = 'holiday-name';
    nameSpan.textContent = holiday.name;

    li.appendChild(dateSpan);
    li.appendChild(nameSpan);
    holidayList.appendChild(li);
  });
}

// Scroll ile ortaya cikma animasyonu
const revealItems = document.querySelectorAll('.reveal');

if (revealItems.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
}
