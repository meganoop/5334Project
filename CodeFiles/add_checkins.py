import csv
f = open('yelp_academic_dataset_checkin.csv')
csv_file = csv.reader(f)
new_file = open('business_checkin.csv','w',newline='')
newfile_holder = csv.writer(new_file)
header=['business_id','checkin_count']
newfile_holder.writerow(header)
next(csv_file)
for row in csv_file:
    buis_chkin =[]
    num_checkin = 0
    buisn = "NULL"
    for x in row:
        if x=="checkin":
            type = x
        elif(len(x)>2):
            buisn = x
        elif(len(x)>0):
            num_checkin += int(x, base=10)
    buis_chkin.append(buisn)
    buis_chkin.append(num_checkin)
    newfile_holder.writerow(buis_chkin)
#print(buis_chkin)
new_file.close()
f.close()
