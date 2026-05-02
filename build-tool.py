# Import os for files, json for data, and PIL for images
# Define input folder as 'images-raw' and output as 'images'
# Ensure the output folder exists using os.makedirs
# Loop through every file in 'images-raw'
# 1. Split filename by '_' to get the Answer (part 0)
# 2. Clean the Answer: replace '-' with ' ', and handle "Halleys Comet" -> "Halley's Comet"
# 3. Open image with PIL, resize to 800px width (keep aspect ratio)
# 4. Save as .webp in the 'images' folder
# 5. Append {"name": clean_name, "image": "images/filename.webp"} to a list called 'quiz_data'
# Save the 'quiz_data' list into a file called 'data.json' using json.dump
import os
import json
from PIL import Image  # type: ignore[import-not-found]
input_folder = 'images-raw'
output_folder = 'images'
os.makedirs(output_folder, exist_ok=True)
quiz_data = []
for filename in os.listdir(input_folder):
    if filename.endswith('.jpg') or filename.endswith('.png'):
        print(f"🚀 Processing: {filename}...")
        # Extract the answer from the filename
        answer = filename.split('_')[0]
        # Clean the answer
        clean_name = answer.replace('-', ' ').title() # Turns 'mars rover' into 'Mars Rover'
        if clean_name.lower() == "halleys comet":
            clean_name = "Halley's Comet"
        # Open and resize the image
        img_path = os.path.join(input_folder, filename)
        img = Image.open(img_path)
        width_percent = (800 / float(img.size[0]))
        height_size = int((float(img.size[1]) * float(width_percent)))
        # Use appropriate resampling filter (ANTIALIAS is an alias for LANCZOS)
        try:
            resample = Image.Resampling.LANCZOS
        except AttributeError:
            resample = Image.ANTIALIAS
        img = img.resize((800, height_size), resample)
        # Save as .webp
        output_path = os.path.join(output_folder, f"{os.path.splitext(filename)[0]}.webp")
        img.save(output_path, 'WEBP')
        # Append to quiz_data
        quiz_data.append({"name": clean_name, "image": output_path.replace("\\", "/")})

# Save the quiz_data to a JSON file
with open('data.json', 'w') as f:
    json.dump(quiz_data, f, indent=4)
