document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("aiSuggestBtn");
  const resultBox = document.getElementById("aiResult");
  const aiText = document.getElementById("aiText");
  const applyBtn = document.getElementById("aiApplyBtn");

  if (!btn) return;

  const priceInput = document.querySelector('input[name="listing[price]"]');
  const locationInput = document.querySelector('input[name="listing[location]"]');
  const descInput = document.querySelector('textarea[name="listing[description]"]');

  // OPTIONAL fields (if you don’t have them, it will use defaults)
  const roomsInput = document.querySelector('input[name="listing[rooms]"]');
  const bathroomsInput = document.querySelector('input[name="listing[bathrooms]"]');
  const guestsInput = document.querySelector('input[name="listing[guests]"]');

  let lastRecommended = null;

  function getAmenities() {
    // If you have amenities checkboxes with name listing[amenities]
    const checked = document.querySelectorAll('input[name="listing[amenities]"]:checked');
    return Array.from(checked).map((c) => c.value);
  }

  btn.addEventListener("click", async () => {
    btn.disabled = true;
    btn.textContent = "Predicting...";

    try {
      const payload = {
        city: (locationInput?.value || "Unknown").trim(), // using location as city for now
        amenities: getAmenities(),
        description: (descInput?.value || "").trim(),
        rooms: Number(roomsInput?.value || 1),
        bathrooms: Number(bathroomsInput?.value || 1),
        guests: Number(guestsInput?.value || 2),
      };

      const res = await fetch("/api/price-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data?.details ? JSON.stringify(data.details) : "AI failed");

      lastRecommended = data.recommendedPrice;

      aiText.innerHTML =
        `AI suggested range: <b>₹${data.minPrice}</b> - <b>₹${data.maxPrice}</b><br/>` +
        `Recommended: <b>₹${data.recommendedPrice}</b> (confidence ${data.confidence})`;

      resultBox.style.display = "block";
    } catch (err) {
      resultBox.style.display = "block";
      aiText.innerHTML = `❌ Could not predict price. Check console.`;
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = "Suggest Price (AI)";
    }
  });

  applyBtn.addEventListener("click", () => {
    if (!priceInput || lastRecommended == null) return;
    priceInput.value = lastRecommended;
  });
});