'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


class Workout {

    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;   // [lat, lng]
        this.distance = distance;  // in km
        this.duration = duration;  // in min
    }
}

class Running extends Workout {
    type = 'running';
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration, cadence);
        this.cadence = cadence;
        this.calcPace();
    }

    calcPace() {
        // min/km
        this.pace = this.duration / this.distance;
        return this.pace
    }
}

class Cycling extends Workout {
    type = 'cycling';
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration, elevationGain);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }

    calcSpeed() {
        // min/km
        this.speed = this.distance / (this.duration / 60 );
        return this.speed
    }
}


// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(run1, cycling1);


///////////////////////////////////////////////////////////////////////////////////////////////////////////

// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class App {
    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getPosition();

        form.addEventListener('submit', this._newWorkout.bind(this));
        
        inputType.addEventListener('change', this._toggleElevationField);
    }


    _getPosition() {
        if(navigator.geolocation) 
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function() {
                alert('Could not get your position');
            });
        };


    _loadMap(position) {
            const {latitude} = position.coords;
            const {longitude} = position.coords;
            console.log(`https://www.google.ng/maps/@${latitude},${longitude}`);

            const coords = [latitude, longitude]

            this.#map = L.map('map').setView(coords, 13);

            L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
                attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
            }).addTo(this.#map);

            // Handle clicks on map
            this.#map.on('click', this._showForm.bind(this)); 
        };
    

    _showForm(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }


    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }


    _newWorkout(e) {

        const validInputs = (...inputs) => 
        inputs.every(inp => Number.isFinite(inp));

        const allPositive = (...inputs) =>
        inputs.every(inp => inp > 0);

        e.preventDefault();

        // Get data from the form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        // If workout is running, create running object
        if(type === 'running') {
            const cadence = +inputCadence.value;

             if(!validInputs(distance, duration, cadence) || 
             !allPositive(distance, duration, cadence))  

                return alert('Inputs have to be positive numbers');

            workout = new Running([lat, lng], distance, duration, cadence);
        }
        // If workout is cycling, create cycling object
        if(type === 'cycling') {
            const elevation = +inputElevation.value;

            if(!validInputs(distance, duration, elevation) || 
            !allPositive(distance, duration))  

                return alert('Inputs have to be positive numbers');

            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // Add new object to workout array
        this.#workouts.push(workout);

        console.log(workout);

        // Render workout on map as marker
        this.renderWorkoutMarker(workout)
        

        // Render workout on list

        // Hide form and clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = '';
        
    }

    renderWorkoutMarker(workout) {
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        }))
        .setPopupContent(`${workout.type}`)
        .openPopup();
    }
}

const app = new App();






