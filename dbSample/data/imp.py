import json
import csv

# Load JSON data from file
with open('courses.json', 'r', encoding='utf-8') as json_file:
    data = json.load(json_file)

# Define CSV file path
csv_file_path = 'courses.csv'

# Open CSV file for writing
with open(csv_file_path, mode='w', newline='', encoding='utf-8') as csv_file:
    # Create CSV writer object
    writer = csv.writer(csv_file)

    # Write header (keys of JSON)
    if isinstance(data, list) and len(data) > 0:
        header = data[0].keys()
        writer.writerow(header)

        # Write data rows
        for item in data:
            writer.writerow(item.values())
    else:
        raise ValueError("JSON data must be a list of objects.")

print(f"Data successfully written to {csv_file_path}")