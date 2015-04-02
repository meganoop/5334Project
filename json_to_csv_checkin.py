# -*- coding: utf-8 -*-
#"""Convert the Yelp Dataset Challenge dataset from json format to csv.
# code credits to git hub repository, https://github.com/Yelp/dataset-examples/blob/master/json_to_csv_converter.py
#"""
import argparse
import collections
import csv
import json


def read_and_write_file(json_file_path, csv_file_path, column_names):
 #   """Read in the json dataset file and write it out to a csv file, given the column names."""
    with open(csv_file_path, 'w+',newline='\n') as fout:
        csv_file = csv.writer(fout)
        #print (list(column_names))
        csv_file.writerow((column_names))
        with open(json_file_path) as fin:
            for line in fin:
                line_contents = json.loads(line)
                list(line_contents)
                csv_file.writerow(get_row(line_contents, column_names))

def get_superset_of_column_names_from_file(json_file_path):
    #"""Read in the json dataset file and return the superset of column names."""
    column_names = set()
    with open(json_file_path) as fin:
        for line in fin:
            line_contents = json.loads(line)
            column_names.update(
                    set(get_column_names(line_contents).keys())
                    )

    column_name_list = list(column_names)
#    print("-------------------")
    column_name_list.append("type")
    #column_names = set(column_name_list)
#    print(column_name_list)
    return column_name_list

def get_column_names(line_contents, parent_key=''):
    #print("inside")
    #print(line_contents)
    column_names = []
    for k, v in iter(line_contents.items()):
        column_name = "{0}.{1}".format(parent_key, k) if parent_key else k
        if isinstance(v, collections.MutableMapping):
            column_names.extend(
                    get_column_names(v, column_name).items()
                    )
        elif(column_name=='type'):
            continue #print("--------------------------type")
		    #something = "blah"
        else:
            #print(column_name)
            column_names.append((column_name, v))
    return dict(column_names)

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
            row.append('')
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
    csv_file = '{0}.csv'.format(json_file.split('.json')[0])

    column_names = get_superset_of_column_names_from_file(json_file)
    read_and_write_file(json_file, csv_file, column_names)