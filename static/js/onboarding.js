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

    window.location.href = '/assessment';
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
});
