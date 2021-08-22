#!/usr/bin/env bash

# Artillery scenarios
peopleArray=("health.yml" "rides/createRide.yml" "rides/getRides.yml" "rides/getRideById.yml")

# Run scenarios

for scenario in "${peopleArray[@]}"
do
    echo "Running scenario: ${scenario%.yml}"
    IFS='/' read -ra scenario_name_split <<< ${scenario%.yml}
    artillery run --output ./artillery/${scenario_name_split[-1]%.yml}_report.json --config ./artillery/config.yml ./artillery/scenarios/${scenario}
done
echo 'Finished artillery tests'