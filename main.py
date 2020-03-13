import requests, os, csv, mpu
from bs4 import BeautifulSoup
from uszipcode import SearchEngine


def pull_online():
    r = requests.get('https://www.ahd.com/states/hospital_NY.html')
    r = requests.get((os.getcwd()) + '/NYHospital.htm')
    htmldoc = r.text
    print(htmldoc[119187])
    soup = BeautifulSoup(htmldoc, 'html.parser', encoding='cp1252')
    currentdir = os.getcwd()
    rr = soup.find('div', {'class': 'report'}).get_text()
    return rr


def pull_safe(location, wd):
    nwd = wd + location
    page = open(nwd)
    soup = BeautifulSoup(page, "html.parser", exclude_encodings=["utf-8"])
    hospital = list()
    templist = list()
    tempcount = 0
    for td in soup.find('div', {'class': 'report'}).parent.find_all('td'):
        if tempcount != 5:
            templist.append(td.text)
            tempcount += 1
        else:
            templist.append(td.text)
            hospital.append(templist)
            templist = list()
            tempcount = 0
    return hospital


def datafile_write():
    f = open('datafile.csv', "w+")
    with open('datafile.csv'):
        rr = pull_safe()
        rr = rr.split()
        for line in rr:
            print(line)
            if line == f.readline():
                print('break')
                break
            elif line is None:
                print('passed')
            else:
                pass


def zip_code_distance_calc(starting_point, hospital_location, amount_of_beds, acceptable_distance=40.0):
    print(hospital_location)
    search = SearchEngine(simple_zipcode=True)
    zip1 = search.by_zipcode(starting_point)
    lat1 = zip1.lat
    long1 = zip1.lng
    zip2 = search.by_zipcode(hospital_location)
    lat2 = zip2.lat
    long2 = zip2.lng
    dist = round(mpu.haversine_distance((lat1, long1), (lat2, long2)))
    count = [0, 0]
    if acceptable_distance > dist:
        pass
    else:
        count[0] = int(count[0]) + 1
        count[1] = int(count[1]) + int(amount_of_beds)
    return count


totallocations = ('hospital_NY.html', 'hospital_NJ.html', 'hospital_CT.html')
totalhospitals = None
wd = os.getcwd() + '/HTML_SOURCES/'
for item in totallocations:
    g = (pull_safe(item, wd))
    if not totalhospitals:
        totalhospitals = g
    else:
        for item in g:
            totalhospitals.append(item)
for idx, item in enumerate(totalhospitals):
    nwd = (wd + 'zip_code_database.csv')
    with open(nwd, 'r') as csvfile:
        item.insert(2, 0)
        reader = csv.DictReader(csvfile)
        for row in reader:
            if item[0] == 'T O T A L':
                print(item)
                totalhospitals.remove(item)
                break
            elif item[1] == row['primary_city']:
                item[2] =  row['zip']
                break
            else:
                continue
        if item[2] == 0:
            print('error at location',item)

total = [0, 0]
for item in totalhospitals:
    init = zip_code_distance_calc('11421', item[2], item[3], 40.0)
    total[0] = total[0] + init[0]
    total[1] = total[1] + init[1]
print('there are a total of', total, ' hospitals within 40 miles of your house. good luck!')
