function showLoading(button) {
  const spinner = document.createElement("span");
  spinner.className = "loader";
  spinner.style.marginLeft = "10px";
  spinner.innerHTML = `<svg width="20" height="20" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="35" stroke="white" stroke-width="10" fill="none" stroke-linecap="round">
      <animateTransform attributeName="transform" type="rotate" dur="1s" from="0 50 50" to="360 50 50" repeatCount="indefinite" />
    </circle>
  </svg>`;
  button.appendChild(spinner);
  button.disabled = true;
}

function hideLoading(button) {
  const spinner = button.querySelector(".loader");
  if (spinner) spinner.remove();
  button.disabled = false;
}

document.getElementById('quoteForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const submitBtn = this.querySelector("button");
  showLoading(submitBtn);

  setTimeout(() => {
    const vehicle = document.getElementById('vehicle').value;
    const service = document.getElementById('service').value;
    const email = document.getElementById('email').value;


    const servicePrices = {
      SUV: { 
        "Minor Repair": 450, 
        "Major Repair": 1200, 
        "General Service": 200, 
        "Health Check": 100 
      },
      Minibus: { 
        "Minor Repair": 550, 
        "Major Repair": 1500, 
        "General Service": 350, 
        "Health Check": 150 
      },
      Convertible: { 
        "Minor Repair": 100, 
        "Major Repair": 800, 
        "General Service": 150, 
        "Health Check": 50 
      },
      Other: { 
        "Minor Repair": 200, 
        "Major Repair": 1000, 
        "General Service": 150, 
        "Health Check": 70 
      },
    };

    const basePrice = servicePrices[vehicle]?.[service] || 0;

    const quoteMessage = `Estimated quote for a ${vehicle} (${service}): £${basePrice}. A copy has been sent to ${email}.`;

    const resultDiv = document.getElementById('quoteResult');
    resultDiv.textContent = quoteMessage;
    resultDiv.classList.remove('hidden');

    console.log(`Sending email to ${email}: ${quoteMessage}`);
    hideLoading(submitBtn);
  }, 800);
});


document.getElementById("bookingForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const submitBtn = document.querySelector("#bookingForm button[type='submit']");
  showLoading(submitBtn);

  const name = document.getElementById("custName").value;
  const email = document.getElementById("custEmail").value;
  const dt = new Date(document.getElementById("appointmentDateTime").value);
  const vehicle = document.getElementById("bookingVehicle").value;
  const service = document.getElementById("bookingService").value;
  const motExpiry = document.getElementById("motDate").value;
  const resultBox = document.getElementById("bookingResult");

  const servicePrices = {
    SUV: { "Minor Repair": 450, "Major Repair": 1200, "General Service": 200, "Health Check": 100 },
    Minibus: { "Minor Repair": 550, "Major Repair": 1500, "General Service": 350, "Health Check": 150 },
    Convertible: { "Minor Repair": 100, "Major Repair": 800, "General Service": 150, "Health Check": 50 },
    Other: { "Minor Repair": 200, "Major Repair": 1000, "General Service": 150, "Health Check": 70 },
  };

  let message = "";
  let total = 0;
  let notes = [];

  if (dt.getDay() === 0) {
    resultBox.className = "message error";
    resultBox.innerText = "Sorry, bookings cannot be made on Sundays. We are closed.";
    resultBox.classList.remove("hidden");
    resultBox.scrollIntoView({ behavior: "smooth" });
    hideLoading(submitBtn);
    return;
  }

  if (service === "MOT") {
    if (!motExpiry) {
      resultBox.className = "message error";
      resultBox.innerText = "Please enter the MOT expiry date.";
      resultBox.classList.remove("hidden");
      resultBox.scrollIntoView({ behavior: "smooth" });
      hideLoading(submitBtn);
      return;
    }

    const expiryDate = new Date(motExpiry);
    const timeDiff = Math.ceil((expiryDate - dt) / (1000 * 60 * 60 * 24));

    if (timeDiff > 7) {
      resultBox.className = "message error";
      resultBox.innerText = "MOT can only be booked within 7 days before or after its expiry.";
      resultBox.classList.remove("hidden");
      resultBox.scrollIntoView({ behavior: "smooth" });
      hideLoading(submitBtn);
      return;
    }

    const baseMOT = 40;
    total = baseMOT;

    if (dt > expiryDate) {
      total += baseMOT * 0.30;
      notes.push("30% surcharge applied for booking after expiry.");
    }

    if (dt.getDay() === 6) {
      const saturdayFee = total * 0.50;
      total += saturdayFee + 50;
      notes.push("50% Saturday surcharge and £50 admin fee applied.");
    }

    message = `MOT booking confirmed for ${name}.<br>
               Total charge: <strong>£${total.toFixed(2)}</strong> (VAT exclusive).<br>
               ${notes.length > 0 ? "Note: " + notes.join("<br>") + "." : ""}`;
  } else {
    const base = servicePrices[vehicle]?.[service] || 0;
    total = base;

    if (dt.getDay() === 6) {
      const saturdayFee = total * 0.50;
      total += saturdayFee + 50;
      notes.push("50% Saturday surcharge and £50 admin fee applied.");
    }

    message = `${service} booked for ${name}.<br>
               Estimated charge: <strong>£${total.toFixed(2)}</strong> (VAT exclusive).<br>
               ${notes.length > 0 ? "Note: " + notes.join("<br>") + "." : ""}`;
  }

const selectedTime = dt.toISOString();
const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
const busyTimes = JSON.parse(localStorage.getItem("mechanicBusyTimes") || "[]");

const activeAtTime =
  bookings.filter(b => b.dt === selectedTime).length +
  busyTimes.filter(t => t === selectedTime).length;

if (activeAtTime >= 2) {
  resultBox.className = "message error";
  resultBox.innerText = "Sorry, no mechanic teams are available at this time.";
  resultBox.classList.remove("hidden");
  resultBox.scrollIntoView({ behavior: "smooth" });
  hideLoading(submitBtn);
  return;
}

  bookings.push({ 
    name, 
    email, 
    dt: dt.toISOString(), 
    vehicle, 
    service, 
    mechanics: [] 
  });
  localStorage.setItem("bookings", JSON.stringify(bookings));

  resultBox.className = "message";
  resultBox.innerHTML = message;
  resultBox.classList.remove("hidden");
  resultBox.scrollIntoView({ behavior: "smooth" });
  hideLoading(submitBtn);
});


document.getElementById("bookingService").addEventListener("change", function () {
  const isMOT = this.value === "MOT";
  const expiryDiv = document.getElementById("motExpiryContainer");
  expiryDiv.classList.toggle("hidden", !isMOT);
});

function deleteBooking(index) {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  if (index >= 0 && index < bookings.length) {
    if (confirm("Are you sure you want to cancel this booking?")) {
      bookings.splice(index, 1);
      localStorage.setItem("bookings", JSON.stringify(bookings));
      buildTables(); 
    }
  }
}

function editBooking(index) {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const booking = bookings[index];
  
  const newDate = prompt("Enter new date/time (YYYY-MM-DDTHH:MM):", booking.dt.slice(0, 16));
  const newService = prompt("Enter new service:", booking.service);

  if (newDate && newService) {
    bookings[index] = {
      ...booking,
      dt: new Date(newDate).toISOString(),
      service: newService
    };
    localStorage.setItem("bookings", JSON.stringify(bookings));
    buildTables(); 
  }
}

const sessionAddedSlots = []; 

function buildMechCalendar() {
  const calendar = document.getElementById("mechCalendar");
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const times = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];
  const selectedInfo = document.getElementById("selectedInfo");


  calendar.innerHTML = '';

  const bookings = JSON.parse(localStorage.getItem("bookings") || []);
  const busyTimes = JSON.parse(localStorage.getItem("mechanicBusyTimes") || []).filter(bt => 
    bt.day && bt.time && bt.partner
  );

  const yourSlotsList = document.getElementById("yourSlotsList");
yourSlotsList.innerHTML = busyTimes
  .map((bt, index) => `
    <div class="summary-item">
      ${bt.day} at ${bt.time}<br>
      <strong>Partner:</strong> ${bt.partner}<br>
      <div class="remove-wrapper">
        <button onclick="removeSlot(${index})" class="small-remove-btn">Remove</button>
      </div>
    </div>
  `).join('');



  days.forEach(day => {
    const dayCol = document.createElement("div");
    dayCol.className = "day-column";
    dayCol.innerHTML = `<h3>${day}</h3>`;

    times.forEach(time => {
      const slot = document.createElement("div");
      slot.className = "time-slot";
      slot.textContent = time;

      const isBooked = bookings.some(booking => {
        const bookingDate = new Date(booking.dt);
        return (
          bookingDate.toLocaleDateString('en-US', { weekday: 'long' }) === day &&
          bookingDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) === time
        );
      }) || busyTimes.some(bt => bt.day === day && bt.time === time);

      if (isBooked) {
        slot.classList.add("busy");
        slot.title = "Booked Appointment";
      }

      if (!isBooked) {
        slot.addEventListener("click", async () => {
         const partner = await new Promise(resolve => {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.3);
    z-index: 1000;
    min-width: 250px;
  `;

  const contentBox = document.createElement('div');
  const heading = document.createElement('h4');
  heading.textContent = `Select Partner for ${day} ${time}`;
  heading.style.marginBottom = "10px";

  const select = document.createElement('select');
  select.innerHTML = `
    <option value="" disabled selected>Select Partner</option>
    <option value="Partner 1">Partner 1</option>
    <option value="Partner 2">Partner 2</option>
    <option value="Partner 3">Partner 3</option>
  `;
  select.style.width = "100%";
  select.style.margin = "10px 0";

  const warning = document.createElement('div');
  warning.className = 'warning-message';
  warning.style.color = 'red';
  warning.style.fontSize = '0.85rem';
  warning.style.marginTop = '6px';
  warning.style.display = 'none'; 
  warning.textContent = '⚠ Please select a partner before confirming.';

  const buttonContainer = document.createElement('div');
  buttonContainer.style.textAlign = "right";

  const confirmButton = document.createElement('button');
  confirmButton.textContent = 'Confirm';



  confirmButton.onclick = () => {
    if (select.value) {
      document.body.removeChild(modal);
      resolve(select.value);
    } else {
      warning.style.display = 'block';
    }
  };



  select.addEventListener('change', () => {
    warning.style.display = 'none'; 
  });

buttonContainer.append(confirmButton); 
  contentBox.append(heading, select, warning, buttonContainer);
  modal.appendChild(contentBox);
  document.body.appendChild(modal);
});


          if (!partner) return;
          const newEntry = { day, time, partner };
          busyTimes.push(newEntry);
          localStorage.setItem("mechanicBusyTimes", JSON.stringify(busyTimes));
	  
          if (newEntry.day && newEntry.time && newEntry.partner) {
            const slotItem = document.createElement("div");
            slotItem.className = "summary-item";
            slotItem.innerHTML = `
              ${newEntry.day} at ${newEntry.time}<br>
              <strong>Partner:</strong> ${newEntry.partner}
            `;
            yourSlotsList.appendChild(slotItem);
          }

          slot.classList.add("busy");
          selectedInfo.classList.add("active");
          selectedInfo.innerHTML = `Slot booked with ${partner}`;
        });
      }

      dayCol.appendChild(slot);
    });
    calendar.appendChild(dayCol);
  });

  const appointmentDetails = document.getElementById("appointmentDetails");
  appointmentDetails.innerHTML = bookings.map(booking => `
    <div class="summary-item">
      <p><strong>Name:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Date:</strong> ${new Date(booking.dt).toLocaleDateString()}</p>
      <p><strong>Time:</strong> ${new Date(booking.dt).toLocaleTimeString()}</p>
      <p><strong>Service:</strong> ${booking.service}</p>
    </div>
  `).join('');
}

function removeSlot(index) {
  const busyTimes = JSON.parse(localStorage.getItem("mechanicBusyTimes") || "[]");

  if (index >= 0 && index < busyTimes.length) {
    const confirmDelete = confirm(`Remove slot on ${busyTimes[index].day} at ${busyTimes[index].time}?`);
    if (confirmDelete) {
      busyTimes.splice(index, 1);
      localStorage.setItem("mechanicBusyTimes", JSON.stringify(busyTimes));
      buildMechCalendar(); 
    }
  }
}


function login(type) {
  if (type === 'mech') {
    const id = document.getElementById("mechUser").value;
    const pw = document.getElementById("mechPass").value;
    if (id === "mechanic" && pw === "12345") {
      document.getElementById("mechLogin").classList.add("hidden");
      document.getElementById("mechDashboard").classList.remove("hidden");
      buildMechCalendar();
    } else {
      alert("Wrong password or mechanic ID");
    }
  } else if (type === 'admin') {
    const user = document.getElementById("adminUser").value;
    const pw = document.getElementById("adminPass").value;
    if (user === "admin" && pw === "12345") {
      document.getElementById("adminLogin").classList.add("hidden");
      document.getElementById("adminDashboard").classList.remove("hidden");
      buildTables(); 
    } else {
      alert("Invalid admin credentials");
    }
  }
}


function buildTables() {
  const bookings = JSON.parse(localStorage.getItem("bookings") || "[]");
  const adminTbody = document.querySelector("#adminTable tbody");
  adminTbody.innerHTML = bookings.map((b, i) => `
    <tr>
      <td>${b.name}</td>
      <td>${b.email}</td>
      <td>${new Date(b.dt).toLocaleString()}</td>
      <td>${b.vehicle}</td>
      <td>${b.service}</td>
      <td>
        <button onclick="editBooking(${i})">Edit</button>
        <button onclick="deleteBooking(${i})">Cancel</button>
      </td>
    </tr>
  `).join('');

  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  const contactTbody = document.querySelector("#contactTable tbody");
  contactTbody.innerHTML = contacts.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.message}</td>
      <td><button onclick="replyToCustomer('${c.email}')">Reply</button></td>
    </tr>
  `).join('');
}

const track = document.querySelector(".testimonial-track");
const slides = document.querySelectorAll(".testimonial-slide");
const totalSlides = slides.length;
const slidesPerPage = 3;

let testimonialIndex = 0;

setInterval(() => {
  testimonialIndex = (testimonialIndex + 1) % 6; 
  const translatePercent = (testimonialIndex / totalSlides) * 100;
  track.style.transform = `translateX(-${translatePercent}%)`;
}, 5000);

function updateSlider() {
  const slideWidth = slides[0].offsetWidth + 20; 
  track.style.transform = `translateX(-${testimonialIndex * slideWidth}px)`;
}

function nextSlide() {
  const currentDay = new Date().getDay(); 
  
  if (currentDay === 0) { 
    return;
  }

  testimonialIndex++;
  if (testimonialIndex > totalSlides - getVisibleCount()) {
    testimonialIndex = 0;
  }
  updateSlider();
}

function getVisibleCount() {
  if (window.innerWidth <= 600) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}
  setInterval(nextSlide, 3000);
  window.addEventListener("resize", updateSlider); 
  updateSlider();

document.getElementById("contactForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const name = document.getElementById("contactName").value;
  const email = document.getElementById("contactEmail").value;
  const message = document.getElementById("contactMessage").value;

  const row = document.createElement("tr");
  row.innerHTML = `<td>${name}</td><td>${email}</td><td>${message}</td>
                   <td><button onclick="replyToCustomer('${email}')">Reply</button></td>`;
  document.querySelector("#contactTable tbody").appendChild(row);

  document.getElementById("contactResult")?.remove(); 
  const msg = document.createElement("div");
  msg.id = "contactResult";
  msg.className = "message";
  msg.innerText = "Thank you for your message!";
  document.getElementById("contactForm").appendChild(msg);

  document.getElementById("contactForm").reset();

  const contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
  contacts.push({ name, email, message });
  localStorage.setItem("contacts", JSON.stringify(contacts));

});

function replyToCustomer(email) {
  const reply = prompt(`Type your reply to ${email}:`);
  if (reply) {
    alert(`Reply sent to ${email}: ${reply}`);

    let contacts = JSON.parse(localStorage.getItem("contacts") || "[]");
    contacts = contacts.filter(c => c.email !== email);
    localStorage.setItem("contacts", JSON.stringify(contacts));

    buildTables();
  }
}

function showSection(targetId) {
  document.querySelectorAll('section').forEach(section => {
    section.classList.remove('active-section');
  });

  const target = document.getElementById(targetId);
  if (target) {
    target.classList.add('active-section');
  }
}

document.querySelectorAll('.navbar a, .dropdown-menu a').forEach(link => {
  link.addEventListener('click', function (e) {
    e.preventDefault();
    const targetId = this.getAttribute('href').substring(1);
    showSection(targetId);
    history.pushState(null, '', '#' + targetId);
  });
});

window.addEventListener('load', () => {
  const hash = window.location.hash.substring(1);
  showSection(hash || 'home');
});

window.addEventListener('popstate', () => {
  const hash = window.location.hash.substring(1);
  showSection(hash || 'home');
});

        document.addEventListener('DOMContentLoaded', function() {
            const slides = document.querySelectorAll('.slide');
            const navItems = document.querySelectorAll('.slider-nav-item');
            let currentSlide = 0;
            
            function showSlide(index) {
                slides.forEach(slide => slide.classList.remove('active'));
                navItems.forEach(item => item.classList.remove('active'));
                
                slides[index].classList.add('active');
                navItems[index].classList.add('active');
                currentSlide = index;
            }
            
            setInterval(() => {
                let nextSlide = (currentSlide + 1) % slides.length;
                showSlide(nextSlide);
            }, 5000);
            
            // Nav item click handlers
            navItems.forEach((item, index) => {
                item.addEventListener('click', () => {
                    showSlide(index);
                });
            });
        });

function acceptCookies() {
  document.getElementById("cookiePopup").classList.add("hidden");
}

window.addEventListener("load", () => {
  const popup = document.getElementById("cookiePopup");
  if (popup) {
    popup.classList.remove("hidden");
  }
});


document.getElementById("navToggle").addEventListener("click", function () {
  const navbar = document.querySelector(".navbar");
  navbar.classList.toggle("active");
});

document.querySelectorAll(".navbar a").forEach(link => {
  link.addEventListener("click", () => {
    const navbar = document.querySelector(".navbar");
    if (window.innerWidth <= 768) {
      navbar.classList.remove("active");
    }
  });
});

window.addEventListener("load", () => {
  if (window.innerWidth <= 768 && window.location.hash && window.location.hash !== "#home") {
    setTimeout(() => {
      history.replaceState(null, null, " ");
      window.scrollTo(0, 0);
    }, 0);
  }
});


