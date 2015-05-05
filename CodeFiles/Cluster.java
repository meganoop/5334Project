// Goal: takes in the consolidated business attributes for all restaurants in NC state 
// and divides them into four clusters using k-means clustering based on [lat long]  attributes
//pre condition - Manual conversion of csv file to arff file since the Weka library program can only accept arff file type.

import weka.filters.unsupervised.attribute.Remove;
import weka.filters.unsupervised.instance.RemoveWithValues;

import weka.core.Utils;
import java.io.BufferedReader;
import java.io.FileReader;
import weka.clusterers.ClusterEvaluation;
import weka.clusterers.SimpleKMeans;
import weka.core.Instances;
import java.io.FileWriter;
import weka.filters.Filter;

import java.util.*;

public class Cluster {

	public static void main(String[] args) throws Exception {
		final String COMMA_DELIMITER = ",";
		final String NEW_LINE_SEPARATOR = "\n";
		
		//Reading the ARRF file
		BufferedReader breader = null;
		breader = new BufferedReader(new FileReader("NC_category_checkin_latlong.arff"));
		Instances train = new Instances(breader);
		breader.close();


        //Removing the unwanted column
		String[] options = new String[2];
		options[0] = "-R";
		options[1] = "1,2,3,4"; 
		Remove remove = new Remove();
		remove.setOptions(options);
		remove.setInputFormat(train);
		Instances data = Filter.useFilter(train, remove);



		//Performing simple K-Means clustering and forming 4 clusters
		SimpleKMeans sk = new SimpleKMeans();
		sk.setPreserveInstancesOrder(true);
		sk.setMaxIterations(50);
		sk.setNumClusters(4);
		sk.buildClusterer(data);
		ClusterEvaluation ceval = new ClusterEvaluation();
		ceval.setClusterer(sk);
		ceval.evaluateClusterer(data);
	 	String header = "Price,BusinessId,Category,CheckinCount,lat,long,Cluster";
	 	FileWriter fileWriter = null;
	 	fileWriter = new FileWriter("java_csv_op.csv");
	 		
	 	fileWriter.append(header.toString());
		fileWriter.append(NEW_LINE_SEPARATOR);
		
		
		for (int i = 0; i < data.numInstances(); i++) 
		{
				int cluster = sk.clusterInstance(data.instance(i));
				fileWriter.append(String.valueOf(train.instance(i)+","+cluster ));
				fileWriter.append(NEW_LINE_SEPARATOR);
		}
		fileWriter.flush();
		fileWriter.close();	
	}
}
