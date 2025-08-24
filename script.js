// Create animated starfield
function createStarfield() {
    const starfield = document.getElementById('starfield');
    const numStars = 100;
    
    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 2 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 3 + 's';
        starfield.appendChild(star);
    }
}

// Improved moon phase calculation with known reference point
function getMoonPhase(date) {
    // Known new moon: August 23, 2025, 06:06 UTC (more precise timing)
    const knownNewMoon = new Date('2025-08-23T06:06:00.000Z');
    const currentTime = new Date(date);
    
    // Calculate time difference in milliseconds
    const timeDiff = currentTime.getTime() - knownNewMoon.getTime();
    
    // Convert to days with more precision
    const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
    
    // Lunar cycle is 29.53059 days (synodic period)
    const lunarCycle = 29.53059;
    
    // Calculate position in cycle (0-1, where 0 = new moon)
    let cyclePosition = (daysDiff % lunarCycle);
    if (cyclePosition < 0) cyclePosition += lunarCycle;
    
    const phase = cyclePosition / lunarCycle;
    
    // More accurate illumination calculation
    const illumination = Math.round(50 * (1 - Math.cos(phase * 2 * Math.PI)));
    
    // Determine phase name with precise boundaries (First Quarter should be narrower)
    let phaseName;
    if (phase < 0.033 || phase > 0.967) phaseName = "New Moon";
    else if (phase < 0.235) phaseName = "Waxing Crescent";
    else if (phase < 0.265) phaseName = "First Quarter";  // Much narrower range
    else if (phase < 0.485) phaseName = "Waxing Gibbous";
    else if (phase < 0.515) phaseName = "Full Moon";      // Narrower range
    else if (phase < 0.735) phaseName = "Waning Gibbous";
    else if (phase < 0.765) phaseName = "Last Quarter";   // Much narrower range
    else phaseName = "Waning Crescent";
    
    // Add debug info to see exact values
    console.log(`Date: ${date.toDateString()}, Phase: ${phase.toFixed(3)}, Illumination: ${illumination}%, Name: ${phaseName}`);
    
    return {
        phase: phase,
        illumination: illumination,
        phaseName: phaseName,
        cyclePosition: cyclePosition,
        moonAge: cyclePosition
    };
}

function createMoonStyle(moonData) {
    const phase = moonData.phase;
    const illumination = moonData.illumination;
    let style = '';
    
    if (illumination <= 1) {
        // New Moon - completely dark
        style = 'clip-path: circle(0%);';
    } else if (phase < 0.25) {
        // Waxing Crescent - thin crescent on RIGHT side
        const progress = phase / 0.25; // 0 to 1
        const width = progress * 50; // 0% to 50%
        style = `clip-path: ellipse(${width}% 50% at 100% 50%);`;
    } else if (phase < 0.5) {
        // Waxing Gibbous - show RIGHT side lit (clip away LEFT dark portion)
        const progress = (phase - 0.25) / 0.25; // 0 to 1
        const leftDarkWidth = 50 * (1 - progress); // 50% to 0% (shrinking dark area on left)
        style = `clip-path: inset(0 0 0 ${leftDarkWidth}%);`; // Remove left dark portion
    } else if (phase < 0.75) {
        // Waning Gibbous - show LEFT side lit (clip away RIGHT dark portion)  
        const progress = (phase - 0.5) / 0.25; // 0 to 1
        const rightDarkWidth = 50 * progress; // 0% to 50% (growing dark area on right)
        style = `clip-path: inset(0 ${rightDarkWidth}% 0 0);`; // Remove right dark portion
    } else {
        // Waning Crescent - thin crescent on LEFT side
        const progress = (phase - 0.75) / 0.25; // 0 to 1
        const width = 50 * (1 - progress); // 50% to 0%
        style = `clip-path: ellipse(${width}% 50% at 0% 50%);`;
    }
    
    return style;
}

function getNextPhase(currentDate, targetPhase) {
    let testDate = new Date(currentDate);
    testDate.setDate(testDate.getDate() + 1);
    
    for (let i = 0; i < 60; i++) {
        const moonData = getMoonPhase(testDate);
        if (moonData.phaseName === targetPhase) {
            return testDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        testDate.setDate(testDate.getDate() + 1);
    }
    return 'N/A';
}

function getMoonZodiac(date) {
    // Simplified zodiac calculation - this would need more complex astronomy for precision
    const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
    return signs[Math.floor((dayOfYear / 365) * 12) % 12];
}

function updateCurrentMoon() {
    const today = new Date();
    const moonData = getMoonPhase(today);
    
    document.getElementById('currentDate').textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    document.getElementById('currentPhaseName').textContent = moonData.phaseName;
    document.getElementById('currentIllumination').textContent = `${moonData.illumination}% Illuminated`;
    document.getElementById('moonAge').textContent = `${moonData.moonAge.toFixed(1)} days`;
    document.getElementById('nextFull').textContent = getNextPhase(today, 'Full Moon');
    document.getElementById('nextNew').textContent = getNextPhase(today, 'New Moon');
    document.getElementById('zodiacSign').textContent = getMoonZodiac(today);
    
    const moonLight = document.getElementById('currentMoonLight');
    moonLight.style.cssText = createMoonStyle(moonData);
}

function generateSevenDays() {
    const container = document.getElementById('sevenDays');
    container.innerHTML = '';
    
    for (let i = 1; i <= 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const moonData = getMoonPhase(date);
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        dayCard.innerHTML = `
            <div class="day-date">${date.toLocaleDateString('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            })}</div>
            <div class="day-moon">
                <div class="moon-phase">
                    <div class="moon-light" style="${createMoonStyle(moonData)}"></div>
                </div>
            </div>
            <div class="day-phase">${moonData.phaseName}</div>
            <div class="day-illumination">${moonData.illumination}% illuminated</div>
        `;
        
        container.appendChild(dayCard);
    }
}

function toggleSevenDays() {
    const sevenDaysElement = document.getElementById('sevenDays');
    const isVisible = sevenDaysElement.classList.contains('show');
    
    if (!isVisible) {
        generateSevenDays();
        sevenDaysElement.classList.add('show');
    } else {
        sevenDaysElement.classList.remove('show');
    }
}

function updateToday() {
    updateCurrentMoon();
    const sevenDaysElement = document.getElementById('sevenDays');
    if (sevenDaysElement.classList.contains('show')) {
        generateSevenDays();
    }
}

// Initialize the app
createStarfield();
updateCurrentMoon();