
import json


def join():

    with open("location_info.json") as json_file:
        info = json.loads(json_file.read())

    with open("geo_data.geojson") as json_file:
        geo_data = json.loads(json_file.read())

    #return info, geo_data

    for feature in geo_data["features"]:
        id = feature["properties"]["id"]
        match_info = info[int(id) - 1]
        for key in match_info:
            feature["properties"][key] = match_info[key]

        for prop in ["id", "ID", "loc_name"]:
            feature["properties"].pop(prop, None)

    joined_json = json.dumps(geo_data, indent=4)

    with open("joined.json", "w") as joined_file:
        joined_file.write(joined_json)


if __name__ == '__main__':

    join()

