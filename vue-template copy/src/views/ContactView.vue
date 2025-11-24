<template>
  <div class="contact-container">
    <!-- Contact Heading -->
    <h1 class="contact-heading">Kontaktieren Sie uns!</h1>

    <!-- Contact Info Section -->
    <div class="contact-info">
      <p>
        Wir freuen uns, Sie im Oase Spa begrüßen zu dürfen. Für weitere Informationen oder Termine kontaktieren Sie uns
        unter:
      </p>
      <p>
        E-Mail: <a href="mailto:oasespa@gmail.com" class="contact-link">oasespa@gmail.com</a><br />
        Telefon: <a href="tel:+4314806003" class="contact-link">+43 1 480 6003</a>
      </p>
    </div>

    <!-- Google Maps Embed -->
    <div class="google-maps">
    <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2658.499424836113!2d16.31901310639693!3d48.21625705117987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x476d080b63bdf0af%3A0x42e000d994cd873f!2zV2lsaGVsbWluZW5zdHJhw59lIDIwLCAxMTYwIFdpZW4sIOWlp-WcsOWIqQ!5e0!3m2!1i1024!2i768" 
    width="120%" 
    height="500" 
    frameborder="0" 
    style="border:0" 
    allowfullscreen>
    </iframe>

    </div>
  </div>
</template>

<script>
export default {
  name: "Contact",
};
</script>

<style scoped>
/* Main container styling */
.contact-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: 'Arial', sans-serif;
  color: #333;
  text-align: center;
}

/* Heading styling */
.contact-heading {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #222;
}

/* Contact info styling */
.contact-info {
  font-size: 1rem;
  margin-bottom: 2rem;
}

.contact-info p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

/* Link styling */
.contact-link {
  color: #007BFF;
  text-decoration: none;
}

.contact-link:hover {
  text-decoration: underline;
}

/* Google Maps styling */
.google-maps {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  box-shadow: 3px 4px 20px rgba(0, 0, 0, 0.3);
}

.map-frame {
  border: 0;
  width: 100%;
  height: 400px;
}
</style>
