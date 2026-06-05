import sys
import json

# Predefined Industry Matrix Mapping (Deterministic Layer)
# Maps a source waste generator sector to target consuming sectors
COMPATIBILITY_MATRIX = {
    "Wood Mills": ["Biomass Energy", "Particle Board"],
    "Agro-Processing": ["Agriculture/Fertilizer"],
    "Textiles": ["Paper Recycling", "Insulation Mfg"],
    "Construction": ["Brick Manufacturing", "Infrastructure"]
}

def calculate_jaccard_similarity(set_a, set_b):
    """Calculates the token overlap similarity between two text arrays."""
    if not set_a or not set_b:
        return 0.0
    intersection = set_a.intersection(set_b)
    union = set_a.union(set_b)
    return len(intersection) / len(union)

def main():
    try:
        # Read the inputs passed from Node.js via stdin
        input_data = json.loads(sys.stdin.read())
        
        target_industry = input_data["target_industry"]  # The logged-in buyer looking for waste
        listings = input_data["listings"]                # Array of all available waste listings
        
        scored_listings = []
        target_keywords = set([k.lower() for k in target_industry.get("raw_material_keywords", [])])
        target_type = target_industry.get("industry_type")

        for listing in listings:
            # --- LAYER 1: Matrix Compatibility (60% weight) ---
            source_type = listing.get("industry_type")
            matrix_match = 0.0
            if source_type in COMPATIBILITY_MATRIX and target_type in COMPATIBILITY_MATRIX[source_type]:
                matrix_match = 1.0

            # --- LAYER 2: Keyword Similarity (40% weight) ---
            listing_keywords = set([k.lower() for k in listing.get("keywords", [])])
            keyword_match = calculate_jaccard_similarity(listing_keywords, target_keywords)

            # --- LAYER 3: Compute Combined Score ---
            final_score = (0.6 * matrix_match) + (0.4 * keyword_match)

            # Only return matches that show some mathematical relevance (score > 0)
            if final_score > 0:
                listing["match_score"] = round(final_score * 100, 2)  # Convert to percentage
                scored_listings.append(listing)

        # Sort listings so the highest match percentage shows up first
        scored_listings.sort(key=lambda x: x["match_score"], reverse=True)

        # Print JSON back to Node.js via stdout
        print(json.dumps(scored_listings))

    except Exception as e:
        error_msg = {"error": str(e)}
        print(json.dumps(error_msg))

if __name__ == "__main__":
    main()