// Store
let store = Immutable.Map({
    show: 0,
    rovers: ['Curiosity', 'Opportunity', 'Spirit'],
    photos: null
})

// add markup to the page
const root = document.getElementById('root')
const panel = document.getElementById('selection-panel')

// Function to update store and render new content
const updateStore = (state, newState) => {
    let updatedStore = state.set('photos', newState)
    render(root, panel, updatedStore)
    document.getElementById('root').style.opacity = 1;
    document.getElementById('loader-container').style.opacity = 0;
    document.getElementById('loader-container').style.zIndex = -1;

}

// Function to update selected rover
const updateRover = (state, newRover) => {
    const updatedStore = state.set('show', newRover)
    updateStore(updatedStore, state.get('photos'))
}

// Function to render content
const render = async (root, panel, state) => {
    root.innerHTML = Gallery(state)
    panel.innerHTML = Panel(state)
    if ($('.galleria').length)
        Galleria.run('.galleria')
}


// Higher order function to create gallery content. This is HOF as it returns function call
const Gallery = (state) => {
    return `
        <main>
            <section>
                <h3>Mars Rovers</h3>
                <p>
                    Click on the buttons to see the recent images taken by actual Mars Rovers!
                </p>
            </section>
            <section>
                ${getMarsImages(state)}
            </section>
        </main>
    `
}

// Higher order function to create panel content. This is HOF as it returns function call
// Also uses HOF 'map'
const Panel = (state) => {
    console.log(state.get('rovers'))
    return `
        ${state.get('rovers').map((rover, index) =>
            `<button onclick="update(${index})">${rover}</button>`    
        ).join('')}
    `
}

// listening for load event because page should load before any JS is called
window.addEventListener('load', () => {
    document.getElementById('root').style.opacity = 0;
    document.getElementById('loader-container').style.opacity = 1;
    document.getElementById('loader-container').style.zIndex = 4;
    render(root, panel, store)
    console.log(root)
})

// Pure function that renders infomation requested from the backend
// Uses HOF: map
const getMarsImages = (state) => {
    if (!state.get('photos') || state.get('photos').rover.name !== state.get('rovers')[state.get('show')]) {
        fetchImages(state)
        return `
            <p>Oops, failed to fetch images!</p>
        `
    } else {
        return `
            <div class="galleria">
                ${state.get('photos').photos.map(photo => 
                    `<img src="${photo.url}" data-title="Camera: ${photo.camera}" data-description="Sol: ${photo.sol}">`
                )}
            </div>
            <div class="rover-info">
                <span class="info">Rover name: <span class="info-value">${state.get('photos').rover.name}</span></span>
                <span class="info">Launch date: <span class="info-value">${state.get('photos').rover.launch_date}</span></span>
                <span class="info">Landing date: <span class="info-value">${state.get('photos').rover.landing_date}</span></span>
                <span class="info">Maximum pic date: <span class="info-value">${state.get('photos').rover.max_date}</span></span>
                <span class="info">Rover status: <span class="info-value">${state.get('photos').rover.status}</span></span>
            </div>
        `
    }
}

// API CALLS
const fetchImages = (state) => {
    fetch(`http://localhost:3000/rover`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({rover: state.get('rovers')[state.get('show')]})
    })
        .then(res => res.json())
        .then(info => updateStore(state, info))
        .catch(err => {
            alert('Couldnot fetch images')
            document.getElementById('root').style.opacity = 1;
            document.getElementById('loader-container').style.opacity = 0;
            document.getElementById('loader-container').style.zIndex = -1;
                    
        })
}

// Update rover to show
const update = (index) => {
    updateRover(store, index)
    document.getElementById('root').style.opacity = 0;
    document.getElementById('loader-container').style.opacity = 1;
    document.getElementById('loader-container').style.zIndex = 1;
}


