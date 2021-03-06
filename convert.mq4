//+------------------------------------------------------------------+
//|                                                      convert.mq4 |
//|                        Copyright 2017, MetaQuotes Software Corp. |
//|                                             https://www.mql5.com |
//+------------------------------------------------------------------+
#property copyright "Copyright 2017, MetaQuotes Software Corp."
#property link      "https://www.mql5.com"
#property version   "1.00"
#property strict
//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
  {
//---
//---
   return(INIT_SUCCEEDED);
  }
//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
  {
//---
   
  }
//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
  {
     
   send();
   }
//+------------------------------------------------------------------+

void send(){
   datetime time = Time[0];
   double open = Open[0];
   double low = Low[0];
   double high = High[0];
   double close = Close[0];
   long volume = Volume[0];
   double ask = Ask;
   double bid = Bid;
   string profid = DoubleToStr(OrderProfit(),2);
   sendRequest(time, open, low, high, close, volume, ask, bid, profid);
   Print(time, open, low, high, close, volume, ask, bid, profid);
}

void sendRequest(datetime time, double open, double low, double high, double close, double volume, double ask, double bid, string profit){
   char post[],result[];
   int res;
   int timeout = 5000;
   string cookie=NULL,headers;
   string str = "";
   StringAdd(str, StringFormat("%s,", TimeToStr(time)));
   StringAdd(str, StringFormat("%f,", open));
   StringAdd(str, StringFormat("%f,", low));
   StringAdd(str, StringFormat("%f,", high));
   StringAdd(str, StringFormat("%f,", close));
   StringAdd(str, StringFormat("%f,", volume));
   StringAdd(str, StringFormat("%f,", ask));
   StringAdd(str, StringFormat("%f,", bid));
   StringAdd(str, StringFormat("%f,", profit));
   string url = "http://127.0.0.1";
   StringAdd(url,"/data?");
   StringAdd(url,str);

   res = WebRequest("GET", url, NULL, NULL,5000,post,0,result,headers);
   Print(GetLastError());
   Print(headers); 
   if(res==-1)
  {
   Print("Error in WebRequest. Error code  =",GetLastError());
   //--- Perhaps the URL is not listed, display a message about the necessity to add the address
   MessageBox("Add the address '"+url+"' in the list of allowed URLs on tab 'Expert Advisors'","Error",MB_ICONINFORMATION);
  }
   else{
      Print("response:",res);
   }
}
//+------------------------------------------------------------------+
void HandleResult(string result)
  {
//type
   string split[];
   StringSplit(result,',',split);
   if(ArraySize(split)<1)
     {
      return;
     }
   else
     {
      int pcount=ArraySize(split)-1;
      //type-0 ordersend
      if(StringCompare(split[0],"0",false)==0)
        {
         int cmd=StringToInteger(split[1]);
         double volume=StringToDouble(split[2]);
         double price=StringToDouble(split[3]);
         if(price==0)
           {
            price=Ask;
           }
         double slippage=0;
         int s_count=ArraySize(split);
         if(s_count>4)
           {
            slippage=StringToDouble(split[4]);
           }

         double stoploss=0;
         if(s_count>5)
           {
            stoploss=StringToDouble(split[5]);
           }
         double takeprofit=0;
         if(s_count>6)
           {
            takeprofit=StringToDouble(split[6]);
           }
         int ret=OrderSend(NULL,cmd,volume,price,slippage,stoploss,takeprofit);
         Print(ret);
        }
     }
  }
//+------------------------------------------------------------------+