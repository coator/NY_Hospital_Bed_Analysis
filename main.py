import requests, os, re
from bs4 import BeautifulSoup

def pull():
    r = requests.get('https://www.ahd.com/states/hospital_NY.html')
    r = requests.get((os.getcwd())+'/NYHospital.htm')
    htmldoc = r.text
    soup = BeautifulSoup(htmldoc, 'html.parser')
    currentdir = os.getcwd()
    rr = soup.find('div', {'class':'report'}).get_text()
    return rr

def pull_safe(location):
    for urls in folder:
        url = (os.getcwd())+location
        page = open(url)
        soup = BeautifulSoup(page, 'html.parser')
        hospital = list()
        templist = list()
        tempcount = 0
        for item in location:
            for td in soup.find('div', {'class':'report'}).parent.find_all('td'):
                if tempcount !=5:
                    templist.append(td.text)
                    tempcount+=1
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
        rr =rr.split()
        for line in rr:
            print(line)
            if line == f.readline():
                print('break')
                break
            elif line is None:
                print('passed')
            else:
                pass

totalhospitals = []
totallocations = ('/NYHospital.htm',)
for item in totallocations:
    g = pull_safe(item)

print(g)
#for item in newlist:



