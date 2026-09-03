let currentStep = 1;
const totalSteps = 6;

function showOnboardingError(message) {
  const el = document.getElementById('error-message');
  if (!el) return;
  if (message) {
    el.textContent = message;
    el.classList.remove('hidden');
    el.classList.add('shake');
    setTimeout(() => el.classList.remove('shake'), 400);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } else {
    el.classList.add('hidden');
  }
}

function speakMitra(text) {
  const dialogue = document.getElementById('mitra-dialogue');
  if (dialogue) {
    dialogue.textContent = text;
  }
  if (window.onboardingCharacter) {
    window.onboardingCharacter.setState('talking');
    setTimeout(() => window.onboardingCharacter.setState('idle'), 2500);
  }
}

function updateStageCards() {
  const cards = document.querySelectorAll('.stage-card');
  cards.forEach(card => card.classList.remove('active'));
  const checked = document.querySelector('input[name="class_level"]:checked');
  if (checked) {
    checked.closest('.stage-card').classList.add('active');
  }
}

function updateProgressBar() {
  const indicator = document.getElementById('step-indicator');
  const title = document.getElementById('step-title');
  const fill = document.getElementById('progress-bar-fill');
  
  if (indicator) indicator.textContent = `Step ${currentStep} of ${totalSteps}`;
  
  const currentStepEl = document.getElementById(`step-${currentStep}`);
  if (currentStepEl && title) {
    title.textContent = currentStepEl.dataset.title;
  }
  
  if (fill) {
    fill.style.width = `${(currentStep / totalSteps) * 100}%`;
  }
}

function validateStep(stepIndex) {
  const stepEl = document.getElementById(`step-${stepIndex}`);
  if (!stepEl) return true;
  
  const inputs = stepEl.querySelectorAll('input[required], select[required]');
  let isValid = true;
  
  for (const input of inputs) {
    if (!input.checkValidity()) {
      input.reportValidity();
      isValid = false;
      break;
    }
  }
  
  return isValid;
}

function populateReview() {
  document.getElementById('review-name').textContent = document.getElementById('name').value || '-';
  
  const classLevel = document.querySelector('input[name="class_level"]:checked');
  document.getElementById('review-edu').textContent = classLevel ? classLevel.value : '-';
  
  const dist = document.getElementById('district');
  const taluka = document.getElementById('taluka');
  document.getElementById('review-loc').textContent = `${taluka.value ? taluka.value + ', ' : ''}${dist.options[dist.selectedIndex]?.text || '-'}`;
  
  const cat = document.getElementById('category');
  document.getElementById('review-cat').textContent = cat.options[cat.selectedIndex]?.text || '-';
  
  const mob = document.querySelector('input[name="mobility"]:checked');
  document.getElementById('review-mob').textContent = mob ? mob.parentElement.textContent.trim() : '-';
}

function nextStep() {
  if (!validateStep(currentStep)) return;
  
  if (currentStep < totalSteps) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    currentStep++;
    
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    if (currentStep === totalSteps) {
      populateReview();
      document.getElementById('btn-next').classList.add('hidden');
      document.getElementById('onboarding-submit').classList.remove('hidden');
      speakMitra("छान! आता तुझी सर्व माहिती एकदा तपासून घे. (Great! Please review your information before we start.)");
    } else {
      document.getElementById('btn-prev').classList.remove('hidden');
      
      // Mitra conversational feedback based on step
      if(currentStep === 2) speakMitra("छान नाव आहे तुझं! आता तुझ्या शिक्षणाबद्दल सांग. (Nice name! Tell me about your education.)");
      if(currentStep === 3) speakMitra("तू कुठे राहतोस? यामुळे मी तुझ्या जवळचे कॉलेज शोधू शकेन. (Where are you from? I'll find colleges nearby.)");
      if(currentStep === 4) speakMitra("आता थोडी आर्थिक माहिती हवी आहे, म्हणजे योग्य शिष्यवृत्ती शोधता येईल. (A little about family income to find scholarships.)");
      if(currentStep === 5) speakMitra("शेवटचा टप्पा! तुला कोणत्या भाषेत माहिती हवी आहे? (Almost done! What are your preferences?)");
    }
    
    updateProgressBar();
  }
}

function prevStep() {
  if (currentStep > 1) {
    document.getElementById(`step-${currentStep}`).classList.add('hidden');
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    
    currentStep--;
    
    document.getElementById(`step-${currentStep}`).classList.remove('hidden');
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    document.getElementById('btn-next').classList.remove('hidden');
    document.getElementById('onboarding-submit').classList.add('hidden');
    
    if (currentStep === 1) {
      document.getElementById('btn-prev').classList.add('hidden');
    }
    
    updateProgressBar();
  }
}

async function handleOnboardingSubmit(e) {
  e.preventDefault();
  const form = document.getElementById('onboarding-form');
  if (!form) return;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const fd = new FormData(form);
  const payload = {
    name: fd.get('name'),
    age: fd.get('age'),
    className: fd.get('class_level'),
    district: fd.get('district'),
    taluka: fd.get('taluka'),
    marks: fd.get('marks'),
    income: fd.get('income'),
    category: fd.get('category'),
    gender: fd.get('gender') || '',
    disability: fd.get('disability') === 'on',
    mobility: fd.get('mobility') || 'district',
    budget: fd.get('budget'),
    language: fd.get('language') || 'en',
  };

  const submitBtn = document.getElementById('onboarding-submit');
  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = CareerMitra.t('loading') || 'Saving…';
  }
  showOnboardingError(null);

  try {
    const res = await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('save_failed');
    }

    // Keep the language toggle in sync with what the student chose.
    if (payload.language && payload.language !== CareerMitra.lang) {
      localStorage.setItem('cm-lang', payload.language);
    }
    
    speakMitra("तुझी प्रोफाइल तयार आहे! चला आता करिअर शोधूया. (Profile saved! Let's discover careers.)");
    
    setTimeout(() => {
      window.location.href = '/assessment';
    }, 1500);
  } catch (error) {
    console.error('Onboarding submit error:', error);
    showOnboardingError(CareerMitra.t('profile_saved_error') || 'Please fill in your name, class and district to continue.');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('onboarding-form');
  if (form) {
    form.addEventListener('submit', handleOnboardingSubmit);
  }
  
  // Prevent form submission on enter in inputs, navigate to next instead
  const inputs = document.querySelectorAll('#onboarding-form input');
  inputs.forEach(input => {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentStep < totalSteps) {
          nextStep();
        } else {
          document.getElementById('onboarding-submit').click();
        }
      }
    });
  });
});
