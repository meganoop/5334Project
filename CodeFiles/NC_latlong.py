## Goal: extract only the lat longvalues for all the business in north carolina state

import argparse
import collections
import csv
import json

def read_and_write_file(json_file_path, csv_file_path, column_names):
 #   """Read in the json dataset file and write it out to a csv file, given the column names."""
    with open(csv_file_path, 'w+',newline='\n') as fout:
        csv_file = csv.writer(fout)
        print (list(column_names))
        csv_file.writerow((column_names))
        with open(json_file_path) as fin:
            for line in fin:
                line_contents = json.loads(line)
                list(line_contents)
                row = get_row(line_contents, column_names)
                if row:
                    csv_file.writerow(row)


def get_nested_value(d, key):
    if '.' not in key:
        if key not in d:
            return None
        return d[key]
    base_key, sub_key = key.split('.', 1)
    if base_key not in d:
        return None
    sub_dict = d[base_key]
    return get_nested_value(sub_dict,
	sub_key)

def get_row(line_contents, column_names):
    #"""Return a csv compatible row given column names and a dict."""
    row = []
    for column_name in column_names:
        line_value = get_nested_value(
                        line_contents,
                        column_name,
                        )
        if isinstance(line_value, str):
            row.append('{0}'.format(line_value))
        elif line_value is not None:
            row.append('{0}'.format(line_value))
        else:
            row.append('1')  # in case there is no price range mentioned inset 1 price range
    return row

if __name__ == '__main__':
    #"""Convert a yelp dataset file from json to csv."""

    parser = argparse.ArgumentParser(
            description='Convert Yelp Dataset Challenge data from JSON format to CSV.',
            )

    parser.add_argument(
            'json_file',
            type=str,
            help='The json file to convert.',
            )

    args = parser.parse_args()

    json_file = args.json_file
    csv_file = 'business_latlong.csv'

    column_names = set()
    column_names.add("business_id")
    column_names.add("latitude")
    column_names.add("longitude")	
    column_names_list = list(column_names)
    read_and_write_file(json_file, csv_file, column_names_list)