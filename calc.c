#include <stdio.h>
#include <stdlib.h>
#include <assert.h>




int main(int argc, char const *argv[]){
	

	int fullday=24; 
	int daySegmentUnit=fullday*4;

	int m1_Crush_Cap=15;
	int m2_Crush_Cap=10;


	// 1 is first press, 0 is second, should be backwards if I was a "good" coder
	int m1CrushType=1;
	int m2CrushType=1;

	float pknToPkc1Percent= 0.6;
	float crush2Discount=2/3;

	int leadtimetoast=3*4;
	int m1ToastingTime =leadtimetoast;
	int m2ToastingTime=0;


	float m1Pkc1unit=0.0;
	float m2Pkc1unit=0.0;

	float pkc1Counter=0.0;
	float pkc2Counter=0.0;
	float pknCounter=0.0;

	
	for (int timeUnits = 0; timeUnits < daySegmentUnit; timeUnits++){


		// Machine 1

		if (timeUnits==daySegmentUnit*4*8)
		{
			m2CrushType=0;
			printf("just switched machine 2 to a second press, toot, toot!\n");
		}

		if(m1ToastingTime>timeUnits){
			//the little stop
			printf("ifffff2\n");	
		}

		else if (m1CrushType && pknCounter){
			printf("in m1\n");
			m1Pkc1unit+= daySegmentUnit*m1_Crush_Cap*pknToPkc1Percent;
			pkc1Counter+= daySegmentUnit*m1_Crush_Cap*pknToPkc1Percent;
			printf("!!!%f!!!!!!\n", daySegmentUnit*m1_Crush_Cap*pknToPkc1Percent);
			pknCounter-= daySegmentUnit*m1_Crush_Cap;
		}

		else if (!m1CrushType && pknCounter){
			printf("in m2\n");
			pkc1Counter-= daySegmentUnit*m1_Crush_Cap*crush2Discount;
			pkc2Counter+= daySegmentUnit*m1_Crush_Cap*crush2Discount;
		}


		// Machine2 2

		if(m2ToastingTime>timeUnits){
			//the little stop	
			printf("ifffff2\n");
		}

		else if (m2CrushType && pknCounter){
			printf("in 2m1\n");
			m2Pkc1unit+= daySegmentUnit*m2_Crush_Cap*pknToPkc1Percent;
			pkc1Counter+= daySegmentUnit*m2_Crush_Cap*pknToPkc1Percent;
			pknCounter-= daySegmentUnit*m2_Crush_Cap;
		}
		else if (!m2CrushType && pknCounter){
			printf("in 2m2\n");
			pkc1Counter-= daySegmentUnit*m2_Crush_Cap*crush2Discount;
			pkc2Counter+= daySegmentUnit*m2_Crush_Cap*crush2Discount;
		}

		if (timeUnits%4==0)
		{
			printf("the time is %d hours and %d minutes \n", timeUnits/4, timeUnits%24*15 );
			printf("pkn amount right now: %f tons \n",pknCounter);
			printf("pkc1 amount right now: %f tons \n",pkc1Counter);
			printf("pkc2 amount right now: %f tons \n",pkc2Counter);
		}
		
		//need to think about reseting terms like m2Pkc1unit+= 
		//daySegmentUnit*m2_Crush_Cap*pknToPkc1Percent;
	}

	// printf("hsdlfsjfjs\n");

	return 0;
}