<template>
  <div class="about-us-container">
    <div class="image-container">
      <img src="@/assets/image/oase-spa-logo.png" alt="Oase Spa Logo" class="top-image" />
      <img src="@/assets/image/green_lady.png" alt="Green Lady" class="about-us-image" />
    </div>

    <div class="text">
      <h1 class="top">Herzlich willkommen im Oase Spa</h1>
      <p>Kommen Sie in die Entspannungsoase und entspannen Sie sich in unserem Luxus Spa in 1160 Wien.</p>
      <p>
        Von Massagen, Kosmetik, Nägeln bis zur Fußpflege ist das ganze Wohlfühlpaket für Sie individuell abgestimmt.
        Schließen Sie die Augen und lassen Sie sich von unseren erfahrenen Therapeutinnen mit unseren Vielzahl an
        Behandlungen verwöhnen. Ihr Oase Spa Team
      </p>
      <p>
        Vereinbaren Sie einen Termin bei uns direkt per E-Mail <a href="mailto:oasespa@gmail.com"
          class="link">oasespa@gmail.com</a>
        oder per Telefonanruf <a href="tel:+4314806003" class="link">+43 1 480 6003</a>
      </p>
    </div>
  </div>


  <div class="natural-products-banner">
    <img src="@/assets/image/5.png" alt="100% natürliche Produkte" class="natural-banner-image" />
    <div class="banner-overlay">
      <div class="banner-text">
        <h2>Unsere Philosophie</h2>
        <p>100% Natürliche Produkte</p>
      </div>
    </div>
  </div>

  <div class="natural-products-section">
    <h2>Warum natürliche Produkte?</h2>
    <p>
      Im Oase Spa setzen wir auf 100% natürliche und nachhaltig gewonnene Produkte, um Ihnen eine
      hochwertige und umweltfreundliche Pflege zu garantieren. Unsere Produkte sind frei von schädlichen Chemikalien und
      werden sorgfältig ausgewählt, um Ihnen und Ihrer Haut nur das Beste zu bieten.
    </p>
    <p>
      Diese Produkte fördern nicht nur Ihre Hautgesundheit, sondern schonen auch unsere Umwelt.
      Erleben Sie Behandlungen, die Ihre Haut beleben, Ihre Sinne verwöhnen und Ihnen ein Gefühl von Reinheit und
      Frische verleihen.
    </p>
    <p>
      Vertrauen Sie auf unsere Philosophie – für ein ganzheitliches Wellness-Erlebnis, das Natürlichkeit und Luxus
      vereint.
    </p>
  </div>

    <!-- Öffnungszeiten -->
  <section class="opening-hours mb-4">
    <h2 style="text-align: center; margin-top: 2rem;">Unsere Öffnungszeiten</h2>
    <div class="hours-table">
      <div class="day">
        <span class="day-name">Montag</span>
        <span class="day-time me-4">Geschlossen</span>
      </div>
      <div class="day">
        <span class="day-name">Dienstag</span>
        <span class="day-time">10:00 - 20:00 Uhr</span>
      </div>
      <div class="day">
        <span class="day-name">Mittwoch</span>
        <span class="day-time">10:00 - 20:00 Uhr</span>
      </div>
      <div class="day">
        <span class="day-name">Donnerstag</span>
        <span class="day-time">10:00 - 20:00 Uhr</span>
      </div>
      <div class="day">
        <span class="day-name">Freitag</span>
        <span class="day-time">10:00 - 22:00 Uhr</span>
      </div>
      <div class="day">
        <span class="day-name">Samstag</span>
        <span class="day-time">10:00 - 22:00 Uhr</span>
      </div>
      <div class="day">
        <span class="day-name">Sonntag</span>
        <span class="day-time">10:00 - 22:00 Uhr</span>
      </div>
    </div>
    <p class="holidays-note">
      Hinweis: An Feiertagen haben wir ebenfalls geöffnet!
    </p>
  </section>
</template>


<script>
export default {
  name: 'AboutUs',
};
</script>


<style scoped>
h1 {
  font-size: 35px;
}

p {
  font-size: 17px;
}

.text {
  padding-right: 12%;
  padding-top: 4%;
}

.about-us-container {
  display: flex;
  align-items: flex-start;
  margin: 2rem auto;
  gap: 2rem;
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  border-radius: 8px;
  box-shadow: 2px 4px 8px rgba(0, 0, 0, 0.17);
  padding: 40px;
  width: 95%;
}


.image-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.top-image {
  max-width: 300px;
  width: 150%;
  height: auto;
  margin-bottom: 1rem;
  margin-bottom: 0px;
}


.about-us-image {
  max-width: 370px;
  width: 150%;
  height: auto;
}


.about-us-container div {
  flex: 1;
}

.about-us-container h1 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #222;
  text-align: left;
}

.about-us-container p {
  margin-bottom: 1rem;
}

.about-us-container a {
  color: #007BFF;
  text-decoration: none;
}

.about-us-container a:hover {
  text-decoration: underline;
}

/* Natural Products Banner */
.natural-products-banner {
  position: relative;
  margin: 2rem auto;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
  width: 95%;
}

.natural-banner-image {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.banner-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 30%;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  /* Gradient overlay */
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 1.5rem;
}

.banner-text {
  text-align: right;
  color: white;
}

.banner-text h2 {
  font-size: 36px;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.banner-text p {
  font-size: 24px;
}

/* Natural Products Section */
.natural-products-section {
  background-color: #f8f9fa;
  /* Light grey background for contrast */
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
  margin-bottom: 3rem;
  width: 95%;
  margin: 2rem auto;
}

.natural-products-section h2 {
  font-size: 32px;
  color: #333;
  margin-bottom: 1rem;
}

.natural-products-section p {
  font-size: 18px;
  color: #555;
  margin-bottom: 1rem;
}

/* Opening Hours Section */
.opening-hours {
  margin-top: 40px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.opening-hours h2 {
  font-size: 2rem;
  margin-bottom: 20px;
}

.hours-table {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
  margin: 0 auto;
}

.day {
  display: flex;
  justify-content: space-between;
  font-size: 1.2rem;
  padding: 10px;
  border-bottom: 1px solid #ddd;
}

.day-name {
  font-weight: bold;
}

.day-time {
  color: #555;
}

/* Last item without a border */
.day:last-child {
  border-bottom: none;
}

/* Note for holidays */
.holidays-note {
  text-align: center;
  margin-top: 20px;
  font-size: 1rem;
  color: #333;
  font-style: italic;
}

@media only screen and (max-width: 600px) {
  .about-us-container {
    flex-direction: column; /* Stack items vertically */
    padding: 20px; /* Reduce padding */
    gap: 1rem; /* Smaller gap */
  }

  .top-image, .about-us-image {
    max-width: 100%; /* Make images responsive */
    width: 100%; /* Use full width */
    height: auto;
    margin: 0 auto; /* Center images */
  }

  .text {
    padding: 0; /* Remove side padding for smaller screens */
    text-align: center; /* Center-align text */
  }

  .text h1 {
    font-size: 1.5rem; /* Adjust heading size */
  }

  .text p {
    font-size: 0.9rem; /* Smaller font size */
  }

  .natural-products-banner {
    margin: 1rem auto; /* Adjust spacing */
    height: auto; /* Adjust height */
  }

  .banner-text h2 {
    font-size: 1.5rem; /* Smaller font size for heading */
  }

  .banner-text p {
    font-size: 1rem; /* Smaller font size for subtext */
  }

  .natural-products-section {
    padding: 1rem; /* Reduce padding */
    text-align: left; /* Adjust alignment */
    font-size: 0.9rem; /* Adjust font size */
  }

  .natural-products-section h2 {
    font-size: 1.5rem; /* Smaller heading */
    text-align: center; /* Center align heading */
  }

  .opening-hours {
    padding: 10px; /* Adjust padding */
    margin-top: 20px; /* Reduce spacing */
  }

  .opening-hours h2 {
    font-size: 1.5rem; /* Smaller font size */
  }

  .hours-table {
    width: 100%; /* Full width */
    font-size: 0.9rem; /* Smaller text */
  }

  .day {
    font-size: 1rem; /* Adjust text size */
  }

  .holidays-note {
    font-size: 0.9rem; /* Adjust note size */
  }
}
</style>