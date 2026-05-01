import os

# 1. Point this to the folder where your "Mercury -- 1.jpg" files are
target_folder = 'images-raw'

def fix_filenames():
    if not os.path.exists(target_folder):
        print(f"Error: Could not find the folder '{target_folder}'")
        return

    count = 0
    for filename in os.listdir(target_folder):
        # Only look for files that have the " -- " separator
        if " -- " in filename:
            # Split the name and the number
            # "Mercury -- 1.jpg" becomes ["Mercury", "1.jpg"]
            parts = filename.split(" -- ")
            
            answer_part = parts[0].strip()
            id_part = parts[1].strip()
            
            # Create the new name: "Mercury_1.jpg"
            new_name = f"{answer_part}_{id_part}"
            
            # Get full paths for the rename command
            old_path = os.path.join(target_folder, filename)
            new_path = os.path.join(target_folder, new_name)
            
            # Perform the rename
            os.rename(old_path, new_path)
            print(f"✅ Renamed: {filename} -> {new_name}")
            count += 1

    print(f"\nDone! Successfully renamed {count} files.")

if __name__ == "__main__":
    fix_filenames()