# extracting only Restaurant businesses from NC state with price range and food categories divided into 6 categories
# output as "business_category_restaurant_NC.csv"
# input the yelp academic business dataset.json 
import argparse
import collections
import csv
import json

american_food = ( 'Delis', 'Steakhouses', 'Bagels', 'American (New)', 'American (Traditional)', 'Breakfast & Brunch', 'Coffee & Tea')
asian_food = ('Chinese', 'Thai', 'Indian', 'Asian', 'Japanese')
fast_food = ('Burgers','Sandwiches', 'Fast Food','Hot Dogs')
night_life = ('Bars', 'Lounges', 'Nightlife')

def read_and_write_file(json_file_path, csv_file_path, column_names):
 #   """Read in the json dataset file and write it out to a csv file, given the column names."""
    with open(csv_file_path, 'w+',newline='\n') as fout:
        csv_file = csv.writer(fout)
        print (list(column_names))
        csv_file.writerow((column_names))
        #csv_file.writerow("business_id,zip,state,price")
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
        if column_name == "full_address":
            if "NC" in line_value:
                zip = line_value.split('NC ',1)			#split the full address to get the zip code
                #print(zip[1])
                if len(zip)>1:							#if zip code available append zip else append nothing
                    row.append(zip[1])
                else:
                    row.append('')
        elif column_name == "categories":
            if "Restaurants" not in line_value:
                #If not restaurant return none
                return None
            else:
                #row.append('{0}'.format(line_value))
                if (any(food in line_value for food in fast_food)):
                    row.append('FastFood')					
                elif any(food in line_value for food in asian_food):
                    row.append('Asian')
                elif any(food in line_value for food in american_food):
                    row.append('American')
                elif any(food in line_value for food in night_life):
                    row.append('NightLife')					
                elif "Seafood" in line_value:
                    row.append('Seafood')
                elif "Mexican" in line_value:
                    row.append('Mexican')					
                elif "Pizza" in line_value or "Italian" in line_value :
                    row.append('Italian')				
                else:
                    row.append('AllTypes')
        elif isinstance(line_value, str):
            row.append('{0}'.format(line_value))
        elif line_value is not None:
            row.append('{0}'.format(line_value))
        else:
            row.append('1')  # in case there is no price range mentioned inset 1 price range
    if row:
            if "NC" in row:
                #Only if NC state values return else return None
                return row
    return None

if __name__ == '__main__':

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
    csv_file = 'business_category_restaurant_NC.csv'

    #column_names = get_superset_of_column_names_from_file(json_file)
    column_names = set()
    column_names.add("state")
    column_names.add("business_id")
    column_names.add("full_address")
    column_names.add("attributes.Price Range")
    column_names.add("categories")
    column_names_list = list(column_names)
    read_and_write_file(json_file, csv_file, column_names_list)