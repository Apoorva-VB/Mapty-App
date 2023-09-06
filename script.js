'use strict';

// prettier - ignore;

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    (this.coords = coords),
      (this.distance = distance),
      (this.duration = duration);
  }

  _setDiscription() {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    this.discription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
  click() {
    this.clicks++;
    //console.log(this.classs)
  }
}

class running extends Workout {
  type = 'runing';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calPace();
    this._setDiscription();
  }
  calPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, evelvationGain) {
    super(coords, distance, duration);
    this.evelvationGain = evelvationGain;
    this.calSpeed();
    this._setDiscription();
  }
  calSpeed() {
    this.speed = this.distance / this.duration;
    return this.speed;
  }
}
const run1 = new running([32, -12], 34, 54, 234);
const cyc1 = new cycling([32, -12], 33, 34, 534);
console.log(run1, cyc1);

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapentry;
  #workouts = [];
  #zoom = 13;
  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleEventField);
    containerWorkouts.addEventListener('click', this._selectel.bind(this));
  }
  _getPosition() {
    navigator.geolocation.getCurrentPosition(
      this._loadMap.bind(this),

      function () {
        alert('could not find your location');
      }
    );
  }
  _loadMap(position) {
    console.log(position);
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    console.log(latitude, longitude);
    console.log(`https://www.google.com/maps/${latitude},${longitude}`);
    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#zoom);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    form.classList.remove('hidden');
    inputDistance.focus();

    this.#map.on('click', this._showForm.bind(this));
  }
  _showForm(mapEvent) {
    this.#mapentry = mapEvent;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideform() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleEventField() {
    inputElevation.closest('.form__row ').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row ').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const valu = (...input) => input.every(inp => Number.isFinite(inp));
    const positive = (...input) => input.every(inp => inp > 0);
    e.preventDefault();
    let workout;

    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapentry.latlng;

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (
        !valu(distance, duration, cadence) ||
        !positive(distance, duration, cadence)
      )
        return alert('inputs must be positive');
      workout = new running([lat, lng], distance, duration, cadence);
    }
    if (type === 'cycling') {
      const evelvationGain = +inputElevation.value;
      if (!valu(distance, duration) || !positive(distance, duration))
        return alert('inputs must be positive');
      workout = new cycling([lat, lng], distance, duration, evelvationGain);
    }
    this.#workouts.push(workout);
    console.log(this.#workouts);
    this._renderWorkoutMarker(workout);
    this._renderWorkout(workout);
    this._hideform();
  }
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          closeOnClick: false,
          autoClose: false,
          className: `${workout.type}-popup`,
        })
      )

      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.discription}`
      )
      .openPopup();
  }
  _renderWorkout(workout) {
    //form.insertAdjacentElement('afterend', html);
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <h2 class="workout__title">${workout.discription}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
          workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
        }</span>
        <span class="workout__value">${workout.distance}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>
  `;

    if (workout.type === 'running')
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>`;

    if (workout.type === 'cycling')
      html += `<div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>`;

    form.insertAdjacentHTML('afterend', html);
  }
  _selectel(e) {
    const workoutEl = e.target.closest('.workout');

    console.log(workoutEl);
    if (!workoutEl) return;
    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    this.#map.setView(workout.coords, this.#zoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
    workout.click();
  }
}

const app = new App();
