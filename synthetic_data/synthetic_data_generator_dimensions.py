import csv
import numpy as np

def generate_dataset(filename, n_rows, n_dims):
    headers = [f"dimension_{i+1}" for i in range(n_dims)]
    with open(filename, 'w', newline='') as csvfile:
        writer = csv.writer(csvfile)
        writer.writerow(headers)
        for _ in range(n_rows):
            values = np.random.randint(0, 101, size=n_dims)
            writer.writerow(values.tolist())
    print(f"Generated {n_rows} rows x {n_dims} dimensions in '{filename}'")

# Dataset sizes and dimensions
sizes = [100, 1000, 10000, 100000]
dimensions = [10, 20]

# Generate all combinations
for n_dims in dimensions:
    for size in sizes:
        filename = f"dataset_{n_dims}D_{size}.csv"
        generate_dataset(filename, size, n_dims)