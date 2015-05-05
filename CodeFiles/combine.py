# Goal:  combine csv file containing NC business values with its [checkin] values present in another csv file ()
# Same file is also used combine lat long of NC business with its corresponding category values

import csv
_checkins = []
with open('business_latlong.csv', 'r') as checkins:
    reader = csv.reader(checkins)
    next(reader, None)  # skip the header, won't need that here
    #_checkins = {id: count for id, count in reader}
    _checkins_lat = {id: lat for id, lat, lon in reader}
with open('business_latlong.csv', 'r') as checkins:
    reader_lon = csv.reader(checkins)
    next(reader_lon, None)  
    _checkins_lon = {id: lon for id, lat, lon in reader_lon}	

with open('NC_category_checkin.csv', 'r') as other:
    with open('NC_category_checkin_latlong.csv', 'w', newline='') as output:
        reader = csv.reader(other)
        writer = csv.writer(output)
        writer.writerow(next(reader,None) + ['lat','long'])  # read old header, add checkins and write out
        #print(_checkins.get('HTTgh_AzAfC09l2WyRZX5w'))
        for row in reader:
            # write out original row plus checkin_count if we can find one
            #print(row[3])
            if(_checkins_lat.get(row[0])):
                writer.writerow( row + [ _checkins_lat.get( row[0] ) ] + [ _checkins_lon.get( row[0] ) ] )