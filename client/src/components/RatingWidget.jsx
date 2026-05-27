import React, { useState } from "react";

function RatingWidget({ onRate }) {
  const [value, setValue] = useState(0);

  return (
    <div className="rating-widget">
      <p>Rate this puzzle:</p>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={value >= star ? "star active" : "star"}
            onClick={() => {
              setValue(star);
              onRate(star);
            }}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default RatingWidget;
